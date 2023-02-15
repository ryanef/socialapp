const { USERS_TABLE, TIMELINES_TABLE, POSTS_TABLE } = process.env;
const DynamoDB = require("aws-sdk/clients/dynamodb");
const DocumentClient = new DynamoDB.DocumentClient();
const ulid = require("ulid");
const { PostTypes } = require("../lib/constants");

module.exports.handler = async (event) => {
  const { text } = event.arguments;
  const { username } = event.identity;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const newPost = {
    __typename: PostTypes.POST,
    id,
    text,
    creator: username,
    createdAt: timestamp,
    replies: 0,
    likes: 0,
  };

  await DocumentClient.transactWrite({
    TransactItems: [
      {
        Put: {
          TableName: POSTS_TABLE,
          Item: newPost,
        },
      },
      {
        Put: {
          TableName: TIMELINES_TABLE,
          Item: {
            userId: username,
            postId: id,
            timestamp,
          },
        },
      },
      {
        Update: {
          TableName: USERS_TABLE,
          Key: {
            id: username,
          },
          UpdateExpression: "ADD postsCount :one",
          ExpressionAttributeValues: {
            ":one": 1,
          },
          ConditionExpression: "attribute_exists(id)",
        },
      },
    ],
  }).promise();

  return newPost;
};
