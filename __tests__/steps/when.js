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
const we_invoke_getImageUploadUrl = async (
  username,
  extension,
  contentType
) => {
  //this will construct event payload
  const handler = require("../../functions/imageUploadURL").handler;
  const context = {};
  const event = {
    identity: { username },
    arguments: {
      extension,
      contentType,
    },
  };

  //invoke the handler function with what lambda would expect
  return await handler(event, context);
};

const we_invoke_post = async (username, text) => {
  //this will construct event payload
  const handler = require("../../functions/post").handler;
  const context = {};
  const event = {
    identity: { username },
    arguments: {
      text,
    },
  };

  //invoke the handler function with what lambda would expect
  return await handler(event, context);
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

const a_user_calls_editMyProfile = async (user, input) => {
  const editMyProfile = `
  mutation editMyProfile($input: ProfileInput!) {
    editMyProfile(newProfile: $input) {
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

  const variables = {
    input,
  };

  //needs queries, auth headers, etc..
  const data = await GraphQL(
    process.env.API_URL,
    editMyProfile,
    variables,
    user.accessToken
  );

  const profile = data.editMyProfile;
  console.log(`${user.username} - edited profile`);
  return profile;
};

const a_user_calls_post = async (user, text) => {
  const post = `mutation post($text: String!) {
    post(text: $text){
      text
      likes
      replies
    }
  }`;
  const variables = {
    text,
  };

  const data = await GraphQL(
    process.env.API_URL,
    post,
    variables,
    user.accessToken
  );
  const newPost = data.post;

  console.log(`[${user.username}] - post`);

  return newPost;
};
const a_user_calls_getImageUploadUrl = async (user, extension, contentType) => {
  const getImageUploadUrl = `query getImageUploadUrl($extension: String, $contentType: String) {
    getImageUploadUrl(extension: $extension, contentType: $contentType)
  }`;
  const variables = {
    extension,
    contentType,
  };

  const data = await GraphQL(
    process.env.API_URL,
    getImageUploadUrl,
    variables,
    user.accessToken
  );
  const url = data.getImageUploadUrl;

  console.log(`[${user.username}] - got image upload url`);

  return url;
};
module.exports = {
  we_invoke_confirmUserSignup,
  a_user_signs_up,
  we_invoke_an_appsync_template,
  a_user_calls_getMyProfile,
  a_user_calls_editMyProfile,
  we_invoke_getImageUploadUrl,
  a_user_calls_getImageUploadUrl,
  we_invoke_post,
  a_user_calls_post,
};
