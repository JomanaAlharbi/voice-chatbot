# voice-chatbot
A voice-based chatbot that runs entirely in the browser: it listens to your voice, converts it to text, sends it to Google's Gemini model, then displays and speaks back the response.

# Important Note: This Project Originally Had Errors That Were Fixed

I received the base project files, which contained several bugs preventing it from working, and diagnosed and fixed them one by one. Here are the main issues encountered and how each was resolved:

| Issue | Fix |
|---|---|
| chat.php`'s original path assumed a subfolder `api/ that didn't actually exist | Corrected the require path to match the real file location |
| || and __DIR__ characters were getting dropped during copy/paste of the code | Manually reviewed the sensitive lines and rewrote them correctly |
| The API key validation condition compared the real key against itself (a logic error) instead of comparing against the placeholder value | Fixed the condition to compare against 'ضع_مفتاحك_هنا' only |
| curl_init() was undefined | Enabled the curl extension in php.ini |
| curl_close() was throwing a deprecation warning that broke the JSON response | Removed it, since it has no effect from PHP 8 onward |
| SSL connection failure: unable to get local issuer certificate | Added a root certificate file (`cacert.pem`) and linked it in php.ini via curl.cainfo |
| Generic error messages were hiding the real cause of failures | Modified the code to surface the actual error details instead of a fixed message, which sped up diagnosing the remaining issues |
| The Gemini model name was outdated and deprecated (`gemini-2.0-flash`) | Updated it to the current model, gemini-3.6-flash |

After these fixes, the chatbot works successfully end-to-end: voice recording → speech-to-text → sending to Gemini → receiving the reply → displaying it → converting it to speech.

# Components

| File | Purpose |
|---|---|
| index.html | The chatbot interface |
| style.css | Interface styling |
| app.js | Runs the microphone (Speech-to-Text), sends the text to process.php, and converts the reply to speech (Text-to-Speech) |
| process.php | Receives the text from app.js and securely forwards it to the Gemini API using the secret key |
| config.sample.php | A template config file — copy it to config.php and add your key |
| .htaccess | Additional server-level protection settings |
| .gitignore | Prevents the real config.php (which holds your secret key) from being pushed to the repository |

# Setup Instructions (Running Locally)

# 1. Install PHP
- Download PHP (Thread Safe build is not required since we only use the built-in server) from:
  https://windows.php.net/download/
- Extract it to C:\php
- Add C:\php to your Environment Variables (Path)
- Verify with: php -v

# 2. Enable the cURL Extension
- Open C:\php\php.ini
- Find ;extension=curl and remove the leading semicolon so it becomes:
   extension=curl
  
# 3. Set Up an SSL Certificate (required on Windows)
- Download the certificate file from: https://curl.se/ca/cacert.pem
- Save it to: C:\php\cacert.pem
- In php.ini, add:
   curl.cainfo = "C:\php\cacert.pem"
  
# 4. Get a Gemini API Key
- Go to: https://aistudio.google.com/app/apikey
- Create a new key

# 5. Set Up config.php
- Copy config.sample.php and rename it to config.php
- Replace the placeholder with your real key:
   define('GEMINI_API_KEY', 'your_key_here');
  
# 6. Run the Server
From inside the project folder, run:php -S localhost:8000
Then open your browser to:http://localhost:8000/index.html



Upload all files via FTP or File Manager, except config.sample.php (optional to keep). Create config.
