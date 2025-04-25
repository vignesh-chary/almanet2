import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get("token");

	useEffect(() => {
		if (!token) {
			toast.error("Invalid or expired reset link");
			navigate("/login");
		}
	}, [token, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			await axios.post("/api/auth/reset-password", { token, newPassword: password });
			toast.success("Password reset successfully");
			navigate("/login");
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
					Reset Password
				</h2>
				<p className="mt-2 text-center text-sm text-text-muted dark:text-text-dark-muted">
					Enter your new password below
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-card dark:bg-card-dark py-8 px-4 shadow-soft dark:shadow-card sm:rounded-lg sm:px-10 border border-border dark:border-border-dark">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-text dark:text-text-dark"
							>
								New Password
							</label>
							<div className="mt-1">
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg shadow-sm placeholder-text-muted dark:placeholder-text-dark-muted focus:outline-none focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark sm:text-sm bg-background dark:bg-background-dark text-text dark:text-text-dark"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-text dark:text-text-dark"
							>
								Confirm New Password
							</label>
							<div className="mt-1">
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									autoComplete="new-password"
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
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
								{isLoading ? "Resetting..." : "Reset Password"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordPage; 