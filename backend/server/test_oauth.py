#!/usr/bin/env python3
"""
Simple script to test Google OAuth flow without a frontend.
This script will handle the OAuth redirect URL temporarily.
"""

import urllib.parse
import requests
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import time


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse the query parameters
        parsed_url = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_url.query)

        if "code" in query_params and "state" in query_params:
            code = query_params["code"][0]
            state = query_params["state"][0]

            print(f"\n✅ Received OAuth callback!")
            print(f"Code: {code}")
            print(f"State: {state}")

            # Store the values for the main thread
            self.server.oauth_code = code
            self.server.oauth_state = state

            # Send a response to the browser
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(
                b"""
                <html><body>
                <h2>OAuth Success!</h2>
                <p>You can close this tab. Check your terminal for the results.</p>
                </body></html>
            """
            )

            # Signal that we're done
            self.server.should_shutdown = True
        else:
            self.send_response(400)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(
                b"<html><body><h2>Error: Missing code or state parameter</h2></body></html>"
            )

    def log_message(self, format, *args):
        # Suppress default logging
        pass


def test_oauth_flow():
    """Test the complete OAuth flow"""

    # Configuration
    BACKEND_URL = "http://localhost:8080"
    CALLBACK_PORT = 8090
    CALLBACK_URL = f"http://localhost:{CALLBACK_PORT}/oauth/callback"

    print("🔧 Setting up OAuth test...")
    print(
        f"Make sure your OAUTH_REDIRECT_URL environment variable is set to: {CALLBACK_URL}"
    )
    print(f"Make sure your backend is running on: {BACKEND_URL}")

    # Start a temporary HTTP server to handle the OAuth callback
    server = HTTPServer(("localhost", CALLBACK_PORT), OAuthCallbackHandler)
    server.should_shutdown = False
    server.oauth_code = None
    server.oauth_state = None

    # Run server in a separate thread
    server_thread = threading.Thread(target=lambda: server.serve_forever())
    server_thread.daemon = True
    server_thread.start()

    print(f"\n🌐 Started temporary callback server on port {CALLBACK_PORT}")

    try:
        # Create a session to maintain cookies
        session = requests.Session()
        
        # Step 1: Get the authorization URL
        print("\n📋 Step 1: Getting authorization URL from backend...")
        auth_response = session.get(
            f"{BACKEND_URL}/api/auth/google", allow_redirects=False
        )
        # print the response for debugging
        print(f"Response status: {auth_response.status_code}")

        if auth_response.status_code == 302:
            auth_url = auth_response.headers.get("Location")
            print(f"✅ Got authorization URL: {auth_url}")

            # Step 2: Open browser for user to authorize
            print("\n🔓 Step 2: Opening browser for authorization...")
            print("Please complete the OAuth flow in your browser...")
            webbrowser.open(auth_url)

            # Step 3: Wait for callback
            print("\n⏳ Step 3: Waiting for OAuth callback...")
            start_time = time.time()
            timeout = 120  # 2 minutes timeout

            while not server.should_shutdown and (time.time() - start_time) < timeout:
                time.sleep(0.5)

            if server.should_shutdown and server.oauth_code:
                # Step 4: Test the callback endpoint
                print("\n📞 Step 4: Testing callback endpoint...")
                callback_url = f"{BACKEND_URL}/api/auth/google/callback"
                callback_params = {
                    "code": server.oauth_code,
                    "state": server.oauth_state,
                }

                # Debug: Print the exact URL being called
                print(f"📋 Debug: Callback URL: {callback_url}")
                print(f"📋 Debug: Params: {callback_params}")

                # Construct the full URL manually to see what we're sending
                import urllib.parse

                full_url = f"{callback_url}?{urllib.parse.urlencode(callback_params)}"
                print(f"📋 Debug: Full URL: {full_url}")

                callback_response = session.get(callback_url, params=callback_params)

                if callback_response.status_code == 302:
                    redirect_location = callback_response.headers.get("Location")
                    print(f"✅ OAuth flow completed! Redirect to: {redirect_location}")

                    # Parse the redirect URL to see if we got user info
                    parsed_redirect = urllib.parse.urlparse(redirect_location)
                    redirect_params = urllib.parse.parse_qs(parsed_redirect.query)

                    if "user_id" in redirect_params:
                        print(f"👤 User ID: {redirect_params['user_id'][0]}")
                    if "success" in redirect_params:
                        print("🎉 OAuth authentication successful!")
                elif callback_response.status_code == 200:
                    # Check if we got the frontend HTML page (successful redirect)
                    if "<!doctype html>" in callback_response.text.lower() or "<html" in callback_response.text.lower():
                        print("✅ OAuth flow completed! Successfully redirected to frontend application")
                        print("🎉 OAuth authentication successful!")
                    else:
                        print(f"❌ Unexpected 200 response: {callback_response.text[:200]}...")
                else:
                    print(
                        f"❌ Callback failed with status: {callback_response.status_code}"
                    )
                    print(f"Response: {callback_response.text[:200]}...")
            else:
                print("⏰ Timeout waiting for OAuth callback or user cancelled")

        else:
            print(
                f"❌ Failed to get authorization URL. Status: {auth_response.status_code}"
            )

    except requests.exceptions.ConnectionError:
        print(
            "❌ Could not connect to backend. Make sure it's running on http://localhost:8080"
        )
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        server.shutdown()
        print("\n🛑 Callback server stopped")


if __name__ == "__main__":
    print("🚀 Google OAuth Test Script")
    print("=" * 40)
    test_oauth_flow()
