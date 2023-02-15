const DynamoDB = require("aws-sdk/clients/dynamodb");
const DocumentClient = new DynamoDB.DocumentClient();
const Chance = require("chance");
const chance = new Chance();
//using DocumentClient so we can work with normal JS Objects
// const { USERSTABLE } = process.env;

module.exports.handler = async (event) => {
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    const name = event.request.userAttributes["name"];
    const suffix = chance.string({
      length: 4,
      casing: "upper",
      alpha: true,
      numeric: true,
    });
    const screenname = `${name.replace(/[^a-zA-Z0-9]/g, "")}${suffix}`;
    const user = {
      id: event.userName,
      name,
      screenname,
      createdAt: new Date().toJSON(),
      followersCount: 0,
      followingCount: 0,
    };
    await DocumentClient.put({
      TableName: "rallispace-dev-UsersTable-TAI0KMXD2TZ8",
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    }).promise();
    // cognito triggers want the event itself returned
    return event;
  } else {
    // if we get any other event source trigger besides PostConf ConfirmSignup, ignore it, return event
    return event;
  }
};
