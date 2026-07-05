import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BikeIcon, SearchIcon, ShoppingCartIcon , ChevronDownIcon , UserIcon, XIcon, MenuIcon, PackageIcon, MapPinIcon, ArrowUpRightIcon, ShieldIcon, LogOutIcon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

    const { user , logout} = useAuth()

    const { cartCount, setIsCartOpen } = useCart()

    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navigate = useNavigate();

    const handleSearch = (e: React.SubmitEvent) => {
        e.preventDefault();
        if(searchQuery.trim()){
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery("");
        }
    }

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate("/");
    }

    return (
        <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2 text-2xl font-semibold shrink-0"
                >
                    <BikeIcon size={24} />
                    InstaCart
                </Link>

                {/* Right Section */}
                <div className="flex items-center gap-6 flex-1 justify-end">

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600">

                        <Link
                            to="/"
                            className="hover:text-orange-500 transition"
                        >
                            Home
                        </Link>

                        <Link
                            to="/products"
                            className="hover:text-orange-500 transition"
                        >
                            Products
                        </Link>

                        <Link
                            to="/deals"
                            className="hover:text-orange-500 transition"
                        >
                            Deals
                        </Link>

                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full max-w-sm">

                        <div className="relative w-full">

                            <SearchIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                            />

                            <input
                                type="text"
                                placeholder="Search for groceries and products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-orange-50 border border-orange-200 rounded-full py-2 pl-10 pr-4 text-sm text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-300"
                            />

                        </div>

                    </form>
                    <div className="flex items-center gap-4">  
                        {/* Cart Icon */}
                        <button className="relative p-2 rounded-xl" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCartIcon size={24} className="size-5 text-zinc-900" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-app-orange text-white text-[10px] rounded-full flex-center">{cartCount}</span>}
                        </button>
                    </div>
                    <div className="relative">
                        {/* User Icon */}
                        {user ? (
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2">
                                <div className="size-7 rounded-full bg-green-950 text-white flex-center">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDownIcon className="size-3 text-zinc-500"/>
                            </button>

                        ) : (
                            <div className="flex-center gap-2"> 
                                <Link to='/login' className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-950 rounded-full hover:bg-green-950-light transition-colors">
                                <UserIcon size={16} />Sign In
                                </Link>
                                {userMenuOpen ? <XIcon className="md:hidden" onClick={()=>setUserMenuOpen(!userMenuOpen)}  /> : 
                                    <MenuIcon className="md:hidden" onClick={()=>setUserMenuOpen(!userMenuOpen)}/>}
                            </div>
                        )}
                        {userMenuOpen && (
    <>
        <div
            className="fixed inset-0 z-40"
            onClick={() => setUserMenuOpen(false)}
        />

                        <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-xl shadow-lg border border-app-border py-2 z-50 animate-fade-in">
                            {user && (
                                <div className="px-4 py-2 border-b border-app-border">
                                    <p className="font-medium text-sm text-zinc-900">
                                        {user?.name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>
                            )}
                            <div onClick={() => setUserMenuOpen(false)}>
                                {!user && <Link to='/login'  className="dropdown-link"><UserIcon size={16} />Sign In</Link>}
                                {user && <Link to='/orders' className="dropdown-link" ><PackageIcon size={16} />My Orders</Link>}
                                {user && <Link to='/addresses' className="dropdown-link" ><MapPinIcon size={16} />Addresses</Link>}
                                <Link to='/products' className="dropdown-link md:hidden" ><ArrowUpRightIcon size={16} />Products</Link>
                                <Link to='/deals' className="dropdown-link md:hidden" ><ArrowUpRightIcon size={16} />Deals</Link>
                                {user?.isAdmin && (
                                    <Link to='/admin/products' className="dropdown-link" ><ShieldIcon className="text-app-orange-dark" size={16} /><span className="text-app-orange-dark">Admin Panel</span></Link>
                                )}
                                {user && (
                                    <div className="border-t border-app-border pt-1">
                                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-error hover:bg-red-50 w-full transition-colors">
                                            <LogOutIcon size={16} />Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
                    </div>
                </div>

            </div>

        </nav>
    );
};

export default Navbar;