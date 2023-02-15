require("dotenv").config();
const AWS = require("aws-sdk");
const http = require("axios");
const fs = require("fs");
const user_exists_in_UsersTable = async (id) => {
  const DynamoDB = new AWS.DynamoDB.DocumentClient();

  console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);
  const resp = await DynamoDB.get({
    TableName: process.env.USERSTABLE,
    Key: {
      id,
    },
  }).promise();

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

const post_count_updated_in_UsersTable = async (id, newCount) => {
  const DynamoDB = new AWS.DynamoDB.DocumentClient();

  console.log(
    `looking for new post count for user [${id}] in table [${process.env.USERS_TABLE}]`
  );
  const resp = await DynamoDB.get({
    TableName: process.env.USERSTABLE,
    Key: {
      id,
    },
  }).promise();

  expect(resp.Item).toBeTruthy();
  expect(resp.Item.postsCount).toEqual(newCount);

  return resp.Item;
};

const post_exists_in_PostsTable = async (id) => {
  const DynamoDB = new AWS.DynamoDB.DocumentClient();

  console.log(
    `looking for user post[${id}] in table [${process.env.POSTS_TABLE}]`
  );
  const resp = await DynamoDB.get({
    TableName: process.env.POSTS_TABLE,
    Key: {
      id,
    },
  }).promise();

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

const post_exists_in_TimelinesTable = async (userId, postId) => {
  const DynamoDB = new AWS.DynamoDB.DocumentClient();

  console.log(
    `looking for user post [${postId}] by [${userId}] in table [${process.env.TIMELINES_TABLE}]`
  );
  const resp = await DynamoDB.get({
    TableName: process.env.TIMELINES_TABLE,
    Key: {
      userId,
      postId,
    },
  }).promise();

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

const user_can_upload_image_to_url = async (url, filepath, contentType) => {
  const data = fs.readFileSync(filepath);
  await http({
    method: "put",
    url,
    headers: {
      "Content-Type": contentType,
    },
    data,
  });

  console.log("uploaded image to", url);
};
const user_can_download_image_from = async (url) => {
  const resp = await http(url);

  console.log("downloaded image from", url);

  return resp.data;
};
module.exports = {
  user_exists_in_UsersTable,
  user_can_upload_image_to_url,
  user_can_download_image_from,
  post_exists_in_PostsTable,
  post_exists_in_TimelinesTable,
  post_count_updated_in_UsersTable,
};
