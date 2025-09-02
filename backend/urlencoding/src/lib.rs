#![allow(clippy::all)]
#![allow(clippy::pedantic)]
#![allow(clippy::nursery)]
#![allow(clippy::cargo)]
#![allow(clippy::pub_use)]
#![allow(clippy::expect_used)]

//! To encode a string, do the following:
//!
//! ```rust
//! use urlencoding::encode;
//!
//! let encoded = encode("This string will be URL encoded.");
//! println!("{}", encoded);
//! // This%20string%20will%20be%20URL%20encoded.
//! ```
//!
//! To decode a string, it's only slightly different:
//!
//! ```rust
//! use urlencoding::decode;
//!
//! let decoded = decode("%F0%9F%91%BE%20Exterminate%21").expect("UTF-8");
//! println!("{}", decoded);
//! // 👾 Exterminate!
//! ```
//!
//! To decode allowing arbitrary bytes and invalid UTF-8:
//!
//! ```rust
//! use urlencoding::decode_binary;
//!
//! let binary = decode_binary(b"%F1%F2%F3%C0%C1%C2");
//! let decoded = String::from_utf8_lossy(&binary);
//! ```
//!
//! This library returns [`Cow`](https://doc.rust-lang.org/stable/std/borrow/enum.Cow.html) to avoid allocating when decoding/encoding is not needed. Call `.into_owned()` on the `Cow` to get a `Vec` or `String`.

/// URL encoding functionality
pub mod enc;
pub use enc::{encode, Encoded};

/// URL decoding functionality
pub mod dec;
pub use dec::{decode, decode_binary};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dec::from_hex_digit;

    #[test]
    fn it_encodes_successfully() {
        let expected = "this%20that";
        assert_eq!(expected, encode("this that"));
    }

    #[test]
    fn it_encodes_successfully_emoji() {
        let emoji_string = "👾 Exterminate!";
        let expected = "%F0%9F%91%BE%20Exterminate%21";
        assert_eq!(expected, encode(emoji_string));
    }

    #[test]
    fn it_decodes_successfully() {
        let expected = String::from("this that");
        let encoded = "this%20that";
        assert_eq!(
            expected,
            decode(encoded).expect("failed to decode valid URL-encoded string")
        );
    }

    #[test]
    fn it_decodes_successfully_emoji() {
        let expected = String::from("👾 Exterminate!");
        let encoded = "%F0%9F%91%BE%20Exterminate%21";
        assert_eq!(
            expected,
            decode(encoded).expect("failed to decode valid URL-encoded emoji string")
        );
    }

    #[test]
    fn it_decodes_unsuccessfully_emoji() {
        let bad_encoded_string = "👾 Exterminate!";

        assert_eq!(
            bad_encoded_string,
            decode(bad_encoded_string).expect("failed to decode already-decoded string")
        );
    }

    #[test]
    fn misc() {
        assert_eq!(
            3,
            from_hex_digit(b'3').expect("failed to decode hex digit '3'")
        );
        assert_eq!(
            10,
            from_hex_digit(b'a').expect("failed to decode hex digit 'a'")
        );
        assert_eq!(
            15,
            from_hex_digit(b'F').expect("failed to decode hex digit 'F'")
        );
        assert_eq!(None, from_hex_digit(b'G'));
        assert_eq!(None, from_hex_digit(9));

        assert_eq!("pureascii", encode("pureascii"));
        assert_eq!(
            "pureascii",
            decode("pureascii").expect("failed to decode pure ASCII string")
        );
        assert_eq!("", encode(""));
        assert_eq!("", decode("").expect("failed to decode empty string"));
        assert_eq!("%26a%25b%21c.d%3Fe", encode("&a%b!c.d?e"));
        assert_eq!("%00", encode("\0"));
        assert_eq!("%00x", encode("\0x"));
        assert_eq!("x%00", encode("x\0"));
        assert_eq!("x%00x", encode("x\0x"));
        assert_eq!("aa%00%00bb", encode("aa\0\0bb"));
        assert_eq!("\0", decode("\0").expect("failed to decode null character"));
        let _error = decode("%F0%0F%91%BE%20Hello%21")
            .expect_err("should fail to decode invalid UTF-8 sequence");
        assert_eq!(
            "this that",
            decode("this%20that").expect("failed to decode space character")
        );
        assert_eq!(
            "this that%",
            decode("this%20that%").expect("failed to decode string with trailing %")
        );
        assert_eq!(
            "this that%2",
            decode("this%20that%2").expect("failed to decode string with incomplete escape")
        );
        assert_eq!(
            "this that%%",
            decode("this%20that%%").expect("failed to decode string with double %")
        );
        assert_eq!(
            "this that%2%",
            decode("this%20that%2%").expect("failed to decode string with partial escape")
        );
        assert_eq!(
            "this%2that",
            decode("this%2that").expect("failed to decode string with % in middle")
        );
        assert_eq!(
            "this%%2that",
            decode("this%%2that").expect("failed to decode string with %% sequence")
        );
        assert_eq!(
            "this%2x&that",
            decode("this%2x%26that").expect("failed to decode mixed encoding")
        );
        // assert_eq!("this%2&that", decode("this%2%26that").unwrap());
    }

    #[test]
    fn lazy_writer() {
        let mut s = "he".to_owned();
        Encoded("llo").append_to(&mut s);
        assert_eq!("hello", s);

        assert_eq!("hello", Encoded("hello").to_string());
        assert_eq!("hello", format!("{}", Encoded("hello")));
        assert_eq!("hello", Encoded("hello").to_str());
        assert!(matches!(
            Encoded("hello").to_str(),
            std::borrow::Cow::Borrowed(_)
        ));
    }

    #[test]
    fn whatwg_examples() {
        assert_eq!(*decode_binary(b"%25%s%1G"), b"%%s%1G"[..]);
        assert_eq!(
            *decode_binary("‽%25%2E".as_bytes()),
            b"\xE2\x80\xBD\x25\x2E"[..]
        );
        assert_eq!(encode("≡"), "%E2%89%A1");
        assert_eq!(encode("‽"), "%E2%80%BD");
        assert_eq!(encode("Say what‽"), "Say%20what%E2%80%BD");
    }
}
