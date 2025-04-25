import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Users } from "lucide-react";
import Cookies from "js-cookie";

const HomePage = () => {
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const token = Cookies.get("jwt-linkedin");

    const { data: posts } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/posts", { withCredentials: true });
            return res.data;
        },
    });

    return (
        <div className="relative flex min-h-screen bg-white dark:bg-background-dark overflow-x-hidden" 
             style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans', sans-serif" }}>
            
            {/* Fixed Sidebar - Hidden on mobile, shown on lg screens */}
            <div className="hidden lg:block fixed left-0 top-0 h-screen w-80 border-r border-[#E9DFCE] dark:border-border-dark">
                <Sidebar />
            </div>

            {/* Main Content - Adjusted for mobile and desktop */}
            <div className="w-full lg:ml-80 flex-1 p-4 lg:p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Post Creation */}
                    <div className="mb-6 bg-white dark:bg-card-dark rounded-xl border border-[#E9DFCE] dark:border-border-dark">
                        <PostCreation user={authUser} />
                    </div>

                    {/* Posts Feed */}
                    <div className="space-y-4">
                        {posts?.map(post => (
                            <div key={post._id} className="bg-white dark:bg-card-dark rounded-xl border border-[#E9DFCE] dark:border-border-dark">
                                <Post post={post} />
                            </div>
                        ))}

                        {posts?.length === 0 && (
                            <div className="bg-white dark:bg-card-dark rounded-xl p-6 lg:p-8 text-center border border-[#F4EFE6] dark:border-border-dark">
                                <Users className="mx-auto text-[#019863] dark:text-primary-dark mb-4" size={48} />
                                <h2 className="text-xl lg:text-2xl font-bold text-[#1C160C] dark:text-text-dark mb-2">No Posts Yet</h2>
                                <p className="text-[#A18249] dark:text-text-dark-muted">Connect with others to start seeing posts!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;