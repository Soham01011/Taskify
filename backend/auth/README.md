### Taskify auth service
This branch is for taskify auth service, tyring to keep micro service architechture. This will be automated to make container for each service.

#### The task this service will accomplish will be : 
- Register User
```
/api/auth/register
```
To register user with a unique username and password

- Login 
```
/api/auth/login
```
For user to login and will also provide the auth token and a refresh token

- Verify
```
/api/auth/verify
```
To verify the token provided to the user during the login

- Refresh token
```
/api/auth/refresh
```
To refresh or porvide a new token to user if the current token is expired.


#### Status 

- Register :
  Done

- Login :
  Done

- Verify :
  Done

- Refresh Token :
  Done