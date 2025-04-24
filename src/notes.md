#JWT Authentication

- When the user logs in, a jwt token is created at the server end using token = jwt.sign(payload, secretKey).
- The token is then sent to the client inside a cookie using res.cookie('token', token)
- this token is then validated in all the subsequent api calls.
- eg: when a /profile api is called the token is first extracted form the cookie using
  const token = req.cookies.token
  then the token is verified using jwt.verify(token, secretKey) and by doing this we get the decoded payload
  decoded = jwt.verify(token, secretKey)
  now the user details is extracted from the decoded object using decoded.user and then it is extracted from the database using the user id.
