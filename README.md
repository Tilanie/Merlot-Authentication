# Merlot-Authentication

# Hosting the application on Heroku

Be sure you have Git and the Heroku CLI installed => (Install Git/Heroku)[https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up]

All code needs to be in the master branch and all code need to be functional!

## Pushing to the remote Git (merlot-auth)

Once all code is in master you can push the Git files onto the remote Git (Heroku) by following these steps:
* Make sure you have the latest file locally and the origrin is => "https://github.com/Tilanie/Merlot-Authentication.git"
* Once you have all code locally, you can use this command - (git push merlot-auth master) - to push the origin to the remote
**Note** "merlot-auth" is the name of the remote Git

Thye application will now be availvable at the link => "https://merlot-auth.herokuapp.com/".

## Running the application on Heroku

Once the git has been pushed you can run the application with thus command - (merlot-auth ps:scale web=1) - this will create a free web dyno for the application.

**Note** this dyno will sleep agter 30 mins with no traffic because it is a free dyno. More info on dyno's look [here](https://devcenter.heroku.com/categories/dynos)

## Accessing the application on Heroku

You will now be able to connect to the Heroku app using postman or HTTP by using the link - ("https://merlot-auth.herokuapp.com/authenticate") - and sending a json array as teh body.

**Note** Accessing the page directly will not work because the GET/POST methods requires a body with the request.

## Application logs

You will be able to access the application logs using this command - (heroku logs --tail) -
