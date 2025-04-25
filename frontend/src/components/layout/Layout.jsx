import Navbar from "./Navbar";

const Layout = ({ children }) => {
	return (
		<div className='min-h-screen bg-background dark:bg-background-dark transition-colors duration-200'>
			<Navbar />
			<main className='max-w-7xl mx-auto px-4 py-6 text-text dark:text-text-dark'>{children}</main>
		</div>
	);
};
export default Layout;
