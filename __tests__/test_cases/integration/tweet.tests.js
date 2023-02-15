const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");
const chance = require("chance").Chance();

describe("Given an authenticated user ", () => {
  let user;
  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  describe("When he posts", () => {
    let post;
    const text = chance.string({ length: 16 });
    beforeAll(async () => {
      post = await when.we_invoke_post(user.username, text);
    });
    it("Saves post to Posts Table", async () => {
      await then.post_exists_in_PostsTable(post.id);
    });
    it("Saves post to Timelines Table", async () => {
      await then.post_exists_in_TimelinesTable(user.username, post.id);
    });
    it("Increments post count in users table by 1", async () => {
      await then.post_count_updated_in_UsersTable(user.username, 1);
    });
  });
});
