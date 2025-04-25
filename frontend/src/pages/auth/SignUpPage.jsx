import { Link } from "react-router-dom";
import SignUpForm from "../../components/auth/SignUpForm";

const SignUpPage = () => {
	return (
		<div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background dark:bg-background-dark">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-extrabold text-text dark:text-text-dark">
					Join Almanet
				</h2>
				<p className="mt-2 text-center text-sm text-text-muted dark:text-text-dark-muted">
					Connect with alumni and students to grow your professional network
				</p>
			</div>
			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-card dark:bg-card-dark py-8 px-4 shadow-soft dark:shadow-card sm:rounded-lg sm:px-10 border border-border dark:border-border-dark">
					<SignUpForm />

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border dark:border-border-dark"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-card dark:bg-card-dark text-text-muted dark:text-text-dark-muted">
									Already on Almanet?
								</span>
							</div>
						</div>
						<div className="mt-6">
							<Link
								to="/login"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary dark:text-primary-dark bg-secondary dark:bg-secondary-dark hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition-colors"
							>
								Sign in
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;
