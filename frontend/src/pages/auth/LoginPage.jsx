import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
	return (
		<div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background dark:bg-background-dark">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-extrabold text-text dark:text-text-dark">
					Welcome Back
				</h2>
				<p className="mt-2 text-center text-sm text-text-muted dark:text-text-dark-muted">
					Sign in to your account to continue
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-card dark:bg-card-dark py-8 px-4 shadow-soft dark:shadow-card sm:rounded-lg sm:px-10 border border-border dark:border-border-dark">
					<LoginForm />
					<div className="mt-4 text-right">
						<Link
							to="/forgot-password"
							className="text-sm text-primary dark:text-primary-dark hover:text-primary/80 dark:hover:text-primary-dark/80"
						>
							Forgot Password?
						</Link>
					</div>
					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border dark:border-border-dark"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-card dark:bg-card-dark text-text-muted dark:text-text-dark-muted">
									New to Almanet?
								</span>
							</div>
						</div>
						<div className="mt-6">
							<Link
								to="/signup"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary dark:text-primary-dark bg-secondary dark:bg-secondary-dark hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition-colors"
							>
								Create an Account
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
