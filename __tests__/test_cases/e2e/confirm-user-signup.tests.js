const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");

describe("When a user signs up", () => {
  it("The user's profile should be saved in DynamoDB", async () => {
    // we need a password to sign the user up with cognito
    const { password, name, email } = given.a_random_user();
    console.log(name);
    // cognito needs a name, email and pw.. return the user and capture it
    const user = await when.a_user_signs_up(password, name, email);

    const ddbUser = await then.user_exists_in_UsersTable(user.username);
    expect(ddbUser).toMatchObject({
      id: user.username,
      name,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      followersCount: 0,
      followingCount: 0,
    });

    const [firstName, lastName] = name.split(" ");
    expect(ddbUser.screenname).toContain(firstName);
    expect(ddbUser.screenname).toContain(lastName);
  });
});
