require("dotenv").config();
const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");
const chance = require("chance").Chance();

describe("Given an authenticated user", () => {
  let user;
  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  describe("when a post is made", () => {
    let post;
    const text = chance.string({ length: 16 });
    beforeAll(async () => {
      post = await when.a_user_calls_post(user, text);
    });

    // testing if resolvers are configured correctly
    it("should return valid new post", () => {
      expect(post).toMatchObject({
        text: text,
        likes: 0,
        replies: 0,
      });
    });
  });
});
