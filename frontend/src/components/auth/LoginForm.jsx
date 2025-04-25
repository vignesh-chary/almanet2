import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { mutate: login, isLoading } = useMutation({
		mutationFn: async ({ username, password }) => {
			const response = await axiosInstance.post("/auth/login", {
				username,
				password,
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			toast.success("Login successful!");
			navigate("/");
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Invalid credentials");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		login({ username, password });
	};

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div>
				<label
					htmlFor="username"
					className="block text-sm font-medium text-text dark:text-text-dark"
				>
					Username
				</label>
				<div className="mt-1">
					<input
						id="username"
						name="username"
						type="text"
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="appearance-none block w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg shadow-sm placeholder-text-muted dark:placeholder-text-dark-muted focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent bg-card dark:bg-card-dark text-text dark:text-text-dark transition-colors"
						placeholder="Enter your username"
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-text dark:text-text-dark"
				>
					Password
				</label>
				<div className="mt-1">
					<input
						id="password"
						name="password"
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="appearance-none block w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg shadow-sm placeholder-text-muted dark:placeholder-text-dark-muted focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent bg-card dark:bg-card-dark text-text dark:text-text-dark transition-colors"
						placeholder="Enter your password"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={isLoading}
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? (
						<>
							<Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
							Signing in...
						</>
					) : (
						"Sign in"
					)}
				</button>
			</div>
		</form>
	);
};

export default LoginForm;