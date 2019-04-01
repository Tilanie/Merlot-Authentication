# Merlot-Authentication

Welcome to the Merlot Authentication System team. We are responsible for receiving data from the Mobile Application (ATM Simulation), determining what type of authentication is required and send the data to the subsystem responsible for the authentication of that data.
We also handle the business logic of ensuring only three tries for a user to be authenticated, if the tries exceeded this specified amount the user will be blocked.

Our application is hosted at - https://merlot-auth.herokuapp.com/authenticate

## Requests to our system

**NOTE** - Requests to the API should be structured as JSON objects.

Our system accepts either of the following two requests:

```json
{
 "ID": 1,
 "type":
  [
   "type1",
   "type2"
  ],
   "data": 
  [
   "data1",
   "data2"
  ]
}
```
```json
{
 "ID": 1,
 "type":
  [
   "type"
  ],
   "data": 
  [
   "data"
  ]
}
```
Type refers to the authentication type the user is using and can be one of the following:

* CID  -> Card ID
* PIN  -> Pin for the card
* PIC  -> A photo
* OTP  -> One Time Pin

Data refers to the data sent along associated to that specific type of authentication.

**NOTE** - A user cannot use the same authentication method in order to be authenticated.

**NOTE** - The first authentication type cannot be OTP as their is no way for us the get the Client ID with OTP.

Possible type orders and combinations are as follows:
Correct
* CID - PIN
* CID - PIC
* PIC - CID
* CID - OTP
* PIC - OTP

Incorrect
* PIN - CID
* OTP - CID
* OTP - PIC

**NOTE** - The data sent with OTP can be sent as either an empty string - OTP request is made, or as the string the user entered - To send to OTP in order to authenticate it.

## Responses from our system

Our system will only respond to the ATM Simulation system. A response will be structured as a JSON object and will look like the following:

```json
{
 "Success": "True",
 "ClientID": 123,
 "TriesLeft": 3,
 "Timestemp": 15129837123,
 "Methods": [
 ]
}
```

## Requests to other systems

Requests to other systems are purely internal and the need to show other people what we request is not necassary, but for the sake of completeness we will show what we are requesting to other systems. 

**NOTE** - Since we are relying on other systems the requests may change during the course of this project and thus will add the requests once it is finalized.


---

# Hosting the application on Heroku

Install the following onto your local PC if not installed yet:
* [Git](https://git-scm.com/downloads)
* [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

**Note** - all code needs to be in the master branch and all code needs to be functional!

## Deploy the application

* Clone the the git by using command - (git clone https://github.com/Tilanie/Merlot-Authentication.git) -
* Once you have the code on your local machine, go to the directory of the rpository.

After that is done make sure of the following:

Run command and make sure the output is the same.
```
$ git remote -v
```
```
merlot-auth     https://git.heroku.com/merlot-auth.git (fetch)
merlot-auth     https://git.heroku.com/merlot-auth.git (push)
origin  https://github.com/Tilanie/Merlot-Authentication.git (fetch)
origin  https://github.com/Tilanie/Merlot-Authentication.git (push)
```
 If the remote (merlot-auth) does not exist run the following command.
```term
$ heroku git:remote -a merlot-auth
// set git remote heroku to https://git.heroku.com/merlot-auth.git
```
Rename the remote git to merlot-auth
```term
$ git remote rename heroku merlot-auth
```
Now you can deploy the code with the following command.
Use this command when you want to deploy the latest version of the code.
```
$ git push merlot-auth master
```
The application is now deployed and you can now run the application.

## Running the application

Once the application has been succesfully deployed you can now run the application.

Ensure that at least one instance of the application is running.
```
$ heroku ps:scale web=1
```
Now visit the app at the URL generated by its app name.
```
$ heroku open
```
**Note** - this should throw an error since no body was sent with the request.

## Accessing the application

Once the application is running you can access the application and send requests to it by using [Postman](https://www.getpostman.com/)
Make sure postman is installed and set the folling fields:
* Method -> GET / POST
* Request URL -> https://merlot-auth.herokuapp.com/authenticate
* Body -> {"type":["PIN","PIC"],"data":[123,456]}

**Note** - the body is test data and can be changed
**Note** - the body should be added as "raw", and JSON(application/json)

Once you are ready press send and wait for response.

## View application logs

View information about your running app using one of the [logging commands](https://devcenter.heroku.com/articles/logging),
```
$ heroku logs --tail
```
