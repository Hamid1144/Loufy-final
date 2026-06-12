$urls = @(
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205983/portfolio/base64_8ffa221224572bbd.webp",
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205985/portfolio/base64_c66ccad9a81c5e6f.webp",
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205987/portfolio/base64_8d2b98fcd72dccbe.webp",
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205988/portfolio/base64_31dcb4482ba62266.webp"
)

foreach ($url in $urls) {
  try {
    $resp = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing
    $name = Split-Path $url -Leaf
    Write-Output "$name : $($resp.Headers['Content-Length']) bytes"
  } catch {
    Write-Output "Error fetching $url : $_"
  }
}
