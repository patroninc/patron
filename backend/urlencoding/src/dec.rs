use std::borrow::Cow;
use std::string::FromUtf8Error;

/// Converts a hexadecimal ASCII digit to its numeric value
#[inline]
pub const fn from_hex_digit(digit: u8) -> Option<u8> {
    match digit {
        b'0'..=b'9' => Some(digit.wrapping_sub(b'0')),
        b'A'..=b'F' => Some(digit.wrapping_sub(b'A').wrapping_add(10)),
        b'a'..=b'f' => Some(digit.wrapping_sub(b'a').wrapping_add(10)),
        _ => None,
    }
}

/// Decode percent-encoded string assuming UTF-8 encoding.
///
/// If you need a `String`, call `.into_owned()` (not `.to_owned()`).
///
/// Unencoded `+` is preserved literally, and _not_ changed to a space.
///
/// # Errors
///
/// Returns an error if the decoded bytes are not valid UTF-8.
#[inline]
pub fn decode(data: &str) -> Result<Cow<'_, str>, FromUtf8Error> {
    match decode_binary(data.as_bytes()) {
        Cow::Borrowed(_) => Ok(Cow::Borrowed(data)),
        Cow::Owned(s) => Ok(Cow::Owned(String::from_utf8(s)?)),
    }
}

/// Decode percent-encoded string as binary data, in any encoding.
///
/// Unencoded `+` is preserved literally, and _not_ changed to a space.
///
#[must_use]
pub fn decode_binary(data: &[u8]) -> Cow<'_, [u8]> {
    let offset = data.iter().take_while(|&&c| c != b'%').count();
    if offset >= data.len() {
        return Cow::Borrowed(data);
    }

    let mut decoded = Vec::new();
    if decoded.try_reserve(data.len()).is_err() {
        // Return the original data as borrowed if allocation fails
        return Cow::Borrowed(data);
    }
    let mut out = NeverRealloc(&mut decoded);

    let (ascii, mut remaining) = data.split_at(offset);
    out.extend_from_slice(ascii);

    loop {
        let mut parts = remaining.splitn(2, |&c| c == b'%');
        // first the decoded non-% part
        let Some(non_escaped_part) = parts.next() else {
            break;
        };
        let rest = parts.next();
        if rest.is_none() && out.0.is_empty() {
            // if empty there were no '%' in the string
            return remaining.into();
        }
        out.extend_from_slice(non_escaped_part);

        // then decode one %xx
        match rest {
            Some(rest_slice) => {
                if let Some(&[first, second]) = rest_slice.get(0..2) {
                    if let Some(first_val) = from_hex_digit(first) {
                        if let Some(second_val) = from_hex_digit(second) {
                            out.push((first_val << 4_i32) | second_val);
                            if let Some(next_data) = rest_slice.get(2..) {
                                remaining = next_data;
                            } else {
                                // If there are not enough bytes, break the loop
                                break;
                            }
                        } else {
                            out.extend_from_slice(&[b'%', first]);
                            remaining = match rest_slice.get(1..) {
                                Some(next_data) => next_data,
                                None => break,
                            };
                        }
                    } else {
                        out.push(b'%');
                        remaining = rest_slice;
                    }
                } else {
                    // too short
                    out.push(b'%');
                    out.extend_from_slice(rest_slice);
                    break;
                }
            }
            None => break,
        }
    }
    Cow::Owned(decoded)
}

struct NeverRealloc<'vec_ref, T>(pub &'vec_ref mut Vec<T>);

impl<T> NeverRealloc<'_, T> {
    #[inline]
    pub fn push(&mut self, val: T) {
        // these branches only exist to remove redundant reallocation code
        // (the capacity is always sufficient)
        if self.0.len() != self.0.capacity() {
            self.0.push(val);
        }
    }

    #[inline]
    pub fn extend_from_slice(&mut self, val: &[T])
    where
        T: Clone,
    {
        if self.0.capacity().saturating_sub(self.0.len()) >= val.len() {
            self.0.extend_from_slice(val);
        }
    }
}

#[test]
fn dec_borrows() {
    assert!(matches!(decode("hello"), Ok(Cow::Borrowed("hello"))));
    assert!(matches!(decode("hello%20"), Ok(Cow::Owned(s)) if s == "hello "));
    assert!(matches!(decode("%20hello"), Ok(Cow::Owned(s)) if s == " hello"));
}
