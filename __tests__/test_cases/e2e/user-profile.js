const given = require("../../steps/given");
const when = require("../../steps/when");

describe("Given an authenticated user", () => {
  let user;
  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });
  it("the user can fetch profile with getMyProfile", async () => {
    // calls getMyProf with authenticated user
    const profile = await when.a_user_calls_getMyProfile(user);

    expect(profile).toMatchObject({
      id: user.username,
      name: user.name,
      imageURL: null,
      backgroundImageURL: null,
      bio: null,
      location: null,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      followersCount: 0,
      followingCount: 0,
    });
    const [firstName, lastName] = profile.name.split(" ");
    expect(profile.screenname).toContain(firstName);
    expect(profile.screenname).toContain(lastName);
  });
});
