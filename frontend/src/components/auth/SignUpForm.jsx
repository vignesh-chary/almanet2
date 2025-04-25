import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

const SignUpForm = () => {
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [role, setRole] = useState("");

   const queryClient = useQueryClient();

   const { mutate: signUpMutation, isLoading } = useMutation({
      mutationFn: async (data) => {
         const res = await axiosInstance.post("/auth/signup", data);
         return res.data;
      },
      onSuccess: () => {
         toast.success("Account created successfully");
         queryClient.invalidateQueries({ queryKey: ["authUser"] });
      },
      onError: (err) => {
         toast.error(err.response.data.message || "Something went wrong");
      },
   });

   const handleSignUp = (e) => {
      e.preventDefault();
      signUpMutation({ name, username, email, password, role });
   };

   return (
      <form onSubmit={handleSignUp} className="space-y-4">
         <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
               Full Name
            </label>
            <input
               type="text"
               placeholder="Enter your full name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
               required
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
               Username
            </label>
            <input
               type="text"
               placeholder="Choose a username"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
               required
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
               Email
            </label>
            <input
               type="email"
               placeholder="Enter your email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
               required
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
               Password
            </label>
            <input
               type="password"
               placeholder="Create a password (6+ characters)"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
               required
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
               Role
            </label>
            <select
               value={role}
               onChange={(e) => setRole(e.target.value)}
               className="w-full px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
               required
            >
               <option value="" disabled>Select your role</option>
               <option value="student">Student</option>
               <option value="alumni">Alumni</option>
            </select>
         </div>

         <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
         >
            {isLoading ? (
               <>
                  <Loader className="size-5 animate-spin" />
                  <span>Creating Account...</span>
               </>
            ) : (
               "Create Account"
            )}
         </button>
      </form>
   );
};

export default SignUpForm;
