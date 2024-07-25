<!DOCTYPE html>
<html>
<head>
  <title>Picker API Quickstart</title>
  <meta charset="utf-8" />
</head>
<body>
  <p>Picker API Quickstart</p>

  <button id="authorize_button" onclick="handleAuthClick()">Authorize</button>
  <button id="signout_button" onclick="handleSignoutClick()">Sign Out</button>

  <pre id="content" style="white-space: pre-wrap;"></pre>

  <script src="/traingoogleapi/js/main.js"></script>
  <script async defer src="https://apis.google.com/js/api.js" onload="gapiLoaded()"></script>
  <script src="https://apis.google.com/js/api.js" onload="gapiLoaded()" async defer></script>
  <script async defer src="https://accounts.google.com/gsi/client" onload="gisLoaded()"></script>
</body>
</html>
