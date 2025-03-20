import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Users } from "lucide-react";
import RecommendedUser from "../components/RecommendedUser";
import Cookies from "js-cookie";

const HomePage = () => {
    // Fetch authenticated user
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const token = Cookies.get("jwt-linkedin");

    // Fetch recommended users
    const { data: recommendedUsers, isLoading, isError } = useQuery({
        queryKey: ["recommendedUsers", authUser?._id],
        queryFn: async () => {
            if (!token) throw new Error("No token found");

            const res = await axiosInstance.get(`/recommendations/${authUser._id}/recommendations`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            // console.log("Recommended Users:", res.data);
            if (res.data && Array.isArray(res.data)) {
                // Detailed inspection of each user in the array
                res.data.forEach((user, index) => {
                    // console.log(`Recommended User [${index}]:`, user); // Log each user object
                    if (!user._id) {
                        console.error(`Error: User at index ${index} missing _id:`, user);
                    }
                });
            } else {
                console.error("Error: Recommended Users data is not an array:", res.data);
            }

            return res.data;
        },
        enabled: !!authUser?._id && !!token,
        retry: false,
        // onSuccess: (data) => {
        //     console.log("Recommended Users Query Success:", data);
        //     if (data && Array.isArray(data)) {
        //         // Check data after query success
        //         data.forEach((user, index) => {
        //             console.log(`Success - Recommended User [${index}]:`, user);
        //         });
        //     }
        // },
        // onError: (error) => {
        //     console.error("Recommended Users Query Error:", error);
        // },
    });

    // Fetch posts
    const { data: posts } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/posts", { withCredentials: true });
            return res.data;
        },
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
                <Sidebar user={authUser} />
            </div>

            {/* Main Feed */}
            <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
                <PostCreation user={authUser} />

                {/* Display posts */}
                {posts?.map((post) => (
                    <Post key={post._id} post={post} />
                ))}

                {/* No posts message */}
                {posts?.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="mb-6">
                            <Users size={64} className="mx-auto text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">No Posts Yet</h2>
                        <p className="text-gray-600 mb-6">
                            Connect with others to start seeing posts in your feed!
                        </p>
                    </div>
                )}
            </div>

            {/* Recommended Users */}
            {recommendedUsers?.length > 0 && (
                
                <div className="col-span-1 lg:col-span-1 hidden lg:block">
                    <div className="bg-secondary rounded-lg shadow p-4">
                        <h2 className="font-semibold mb-4">People you may know</h2>
                        {recommendedUsers.map((user, index) => (
                            
                            <RecommendedUser key={user._id || index} user={user} />
                        ))}
                    </div>
                </div>
            )}

            {/* Loading state for recommendations */}
            {isLoading && (
                <div className="col-span-1 lg:col-span-1 hidden lg:block">
                    <div className="bg-secondary rounded-lg shadow p-4">
                        <p>Loading recommendations...</p>
                    </div>
                </div>
            )}

            {/* Error state for recommendations */}
            {isError && (
                <div className="col-span-1 lg:col-span-1 hidden lg:block">
                    <div className="bg-secondary rounded-lg shadow p-4">
                        <p className="text-red-500">Failed to load recommendations.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
