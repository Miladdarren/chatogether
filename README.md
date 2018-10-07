# Simple chat with MEAN stack

A basic chat application that allows:

-   to send and read messages
-   to see connected users

## Stacks

-   **Node.js**
-   **Express**
-   **Angular 6**
-   **MongoDB**
-   **Mongoose** as ODM
-   **Socket.io** for chat support
-   **Passport.js** for authentication by both JWT and social OAuth strategies
-   **Redis** for caching

## NPM Commands

| Command         | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| npm install     | Install dependencies                                           |
| npm run nodemon | Start server @**localhost:3000** with predefined env variables |
| npm run local   | Build angular front end                                        |
| npm run build   | Build angular front end in production mode                     |

## Some of the API endpoints

| HTTP Method | Url                     | Description                             |
| ----------- | ----------------------- | --------------------------------------- |
| GET         | /users/all              | Get all users                           |
| PATCH       | /users/current          | Update current logged in user           |
| POST        | /users/uploadpic        | Upload user profile picture             |
| DELETE      | /users/current          | Delete current logged in user profile   |
| GET         | /auth/google            | Redirect to google for authentication   |
| GET         | /auth/github            | Redirect to github for authentication   |
| GET         | /auth/linkedin          | Redirect to linkedin for authentication |
| GET         | /messages/:name1/:name2 | Get private conversation                |
| GET         | /messages/:name2        | Get chat-room conversation              |

## Live version

[ChaTogether](https://chatogether.herokuapp.com)
