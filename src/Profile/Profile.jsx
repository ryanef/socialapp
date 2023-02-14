import Welcome from "./Welcome"
import YourRecentActivity from "./YourRecent"
import FriendsRecentActivity from "./FriendsRecent"
import Communication from "./Communication"
import Friends from "./Friends"
const Profile = () => {
    return (
        <div className="w-8/12 mx-auto grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            <Welcome/>
            <YourRecentActivity/>
            <Communication/>
            <FriendsRecentActivity/>
            <Friends/>
        </div>
    )
}

export default Profile