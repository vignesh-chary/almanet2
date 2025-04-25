import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await axios.post("/api/auth/forgot-password", { email });
			toast.success("If an account exists with this email, you will receive a password reset link");
			setEmail("");
		} catch (error) {
			toast.error(error.response?.data?.message || "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background dark:bg-background-dark">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-extrabold text-text dark:text-text-dark">
					Forgot Password
				</h2>
				<p className="mt-2 text-center text-sm text-text-muted dark:text-text-dark-muted">
					Enter your email address and we'll send you a link to reset your password
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-card dark:bg-card-dark py-8 px-4 shadow-soft dark:shadow-card sm:rounded-lg sm:px-10 border border-border dark:border-border-dark">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-text dark:text-text-dark"
							>
								Email address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg shadow-sm placeholder-text-muted dark:placeholder-text-dark-muted focus:outline-none focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark sm:text-sm bg-background dark:bg-background-dark text-text dark:text-text-dark"
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isLoading}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-dark hover:bg-primary/80 dark:hover:bg-primary-dark/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? "Sending..." : "Send Reset Link"}
							</button>
						</div>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border dark:border-border-dark"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-card dark:bg-card-dark text-text-muted dark:text-text-dark-muted">
									Remember your password?
								</span>
							</div>
						</div>
						<div className="mt-6">
							<Link
								to="/login"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary dark:text-primary-dark bg-secondary dark:bg-secondary-dark hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition-colors"
							>
								Back to Login
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage; 