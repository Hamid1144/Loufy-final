$cloud_name = "dtr3yvjac"
$api_key = "453843776219872"
$api_secret = "WDP5Pmku01sVxQJ2pD_npSNL5wA"
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${api_key}:${api_secret}"))
$headers = @{ Authorization = "Basic $credentials" }
$url = "https://api.cloudinary.com/v1_1/$cloud_name/resources/image?type=upload&prefix=portfolio/&max_results=50&direction=desc"
$response = Invoke-RestMethod -Uri $url -Headers $headers
$response.resources | Select-Object public_id, created_at, secure_url, width, height | Format-Table -AutoSize
