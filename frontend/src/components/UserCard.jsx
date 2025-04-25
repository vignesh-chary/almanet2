import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
    return (
        <div className="flex min-w-[960px] max-w-[960px] items-center bg-background dark:bg-background-dark px-4 py-2 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <Link to={`/profile/${user.username}`} className="flex items-center gap-4">
                    <img
                        src={user.profilePicture || "/default-avatar.png"}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                        <p className="text-text dark:text-text-dark text-base font-medium leading-normal transition-colors duration-300">
                            {user.name}
                        </p>
                        <p className="text-text-muted dark:text-text-dark-muted text-sm font-normal leading-normal transition-colors duration-300">
                            {user.headline || "No headline"}
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default UserCard;