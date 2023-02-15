require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.region = process.env.AwsRegion;
const fs = require("fs");
const velocityMapper = require("amplify-appsync-simulator/lib/velocity/value-mapper/mapper");
const velocityTemplate = require("amplify-velocity-template");
const GraphQL = require("../lib/graphql");
const we_invoke_confirmUserSignup = async (username, name, email) => {
  //this will construct event payload
  const handler = require("../../functions/confirmUserSignup").handler;
  const context = {};
  const event = {
    version: "1",
    region: process.env.AwsRegion,
    userPoolId: process.env.CognitoUserPoolId,
    userName: username,
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: username,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        email_verified: "false",
        name: name,
        email: email,
      },
    },
  };

  //invoke the handler function with what lambda would expect
  await handler(event, context);
};

const a_user_signs_up = async (password, name, email) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  const userPoolId = process.env.CognitoUserPoolId;
  const clientId = process.env.CLIENTID;

  const signUpResp = await cognito
    .signUp({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "name", Value: name }],
    })
    .promise();

  const username = signUpResp.UserSub;
  console.log(`[${email}] - user has signed up [${username}]`);

  await cognito
    .adminConfirmSignUp({
      UserPoolId: userPoolId,
      Username: username,
    })
    .promise();

  console.log(`[${email}] - confirmed sign up`);

  return {
    username,
    name,
    email,
  };
};

const we_invoke_an_appsync_template = (templatePath, context) => {
  const template = fs.readFileSync(templatePath, { encoding: "utf-8" });
  const ast = velocityTemplate.parse(template);
  const compiler = new velocityTemplate.Compile(ast, {
    valueMapper: velocityMapper.map,
    escape: false,
  });
  return JSON.parse(compiler.render(context));
};
const a_user_calls_getMyProfile = async (user) => {
  const getMyProfile = `
  query MyQuery {
    getMyProfile {
      bio
      birthdate
      backgroundImageURL
      createdAt
      followersCount
      followingCount
      id
      imageURL
      location
      name
      screenname
    }
  }
  `;

  //needs queries, auth headers, etc..
  const data = await GraphQL(
    process.env.API_URL,
    getMyProfile,
    {},
    user.accessToken
  );

  const profile = data.getMyProfile;
  console.log(`${user.username} - fetched profile`);
  return profile;
};
module.exports = {
  we_invoke_confirmUserSignup,
  a_user_signs_up,
  we_invoke_an_appsync_template,
  a_user_calls_getMyProfile,
};
