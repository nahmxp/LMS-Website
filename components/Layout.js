import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import { useAuth } from '../lib/AuthContext';

export default function Layout({ children }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showCookieWarning, setShowCookieWarning] = useState(false);
  
  console.log('user:', user);
  // Force re-render of navigation when authentication status changes
  const [navKey, setNavKey] = useState(0);
  
  useEffect(() => {
    // Update navigation key when auth state changes
    setNavKey(prevKey => prevKey + 1);
  }, [isAuthenticated, isAdmin, user]);

  // Load wishlist count
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setWishlistCount(0);
      return;
    }

    const fetchWishlistCount = async () => {
      try {
        // Try to fetch wishlist from API first
        const response = await fetch('/api/user/wishlist');
        if (response.ok) {
          const wishlistData = await response.json();
          const items = wishlistData.items || [];
          setWishlistCount(items.length);
          return;
        }
      } catch (error) {
        console.error('Error fetching wishlist from API:', error);
      }

      // Fallback to localStorage if API fails
      try {
        const userKey = `wishlist_${user._id}`;
        const savedWishlist = JSON.parse(localStorage.getItem(userKey) || '[]');
        setWishlistCount(savedWishlist.length);
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
      }
    };

    fetchWishlistCount();
    
    // Custom event for updating wishlist count from within the app
    const handleCustomWishlistUpdate = (event) => {
      // Only update if event is for current user
      if (!event.detail || event.detail.userId === user._id) {
        fetchWishlistCount();
      }
    };
    
    window.addEventListener('wishlist-updated', handleCustomWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlist-updated', handleCustomWishlistUpdate);
    };
  }, [isAuthenticated, user]);

  // Load cart count
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      try {
        // Try to fetch cart from API first
        const response = await fetch('/api/user/cart');
        if (response.ok) {
          const cartData = await response.json();
          const items = cartData.items || [];
          const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(totalItems);
          return;
        }
      } catch (error) {
        console.error('Error fetching cart from API:', error);
      }

      // Fallback to localStorage if API fails
      try {
        const userKey = `cart_${user._id}`;
        const savedCart = JSON.parse(localStorage.getItem(userKey) || '[]');
        const totalItems = savedCart.reduce((total, item) => total + (item.quantity || 1), 0);
        setCartCount(totalItems);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    };

    fetchCartCount();
    
    // Custom event for updating cart count from within the app
    const handleCustomCartUpdate = (event) => {
      // Only update if event is for current user
      if (!event.detail || event.detail.userId === user._id) {
        fetchCartCount();
      }
    };
    
    window.addEventListener('cart-updated', handleCustomCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCustomCartUpdate);
    };
  }, [isAuthenticated, user]);

  // Check if cookies are enabled
  useEffect(() => {
    try {
      document.cookie = 'testcookie=1; SameSite=Strict';
      if (document.cookie.indexOf('testcookie=1') === -1) {
        setShowCookieWarning(true);
      }
      // Clean up test cookie
      document.cookie = 'testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch {
      setShowCookieWarning(true);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close navigation dropdowns
      if (!event.target.closest('.dropdown')) {
        setActiveDropdown(null);
      }
      
      // Close profile dropdown
      if (!event.target.closest('.user-profile')) {
        setProfileDropdownOpen(false);
      }
      
      // Close admin dropdown
      if (!event.target.closest('.admin-dropdown')) {
        setAdminDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Function to check if a path is active
  const isActive = (path) => {
    return router.pathname === path ? 'active' : '';
  };
  
  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    // Close admin dropdown if open
    if (adminDropdownOpen) setAdminDropdownOpen(false);
    setActiveDropdown(null);
  };
  
  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
    // Close profile dropdown if open
    if (profileDropdownOpen) setProfileDropdownOpen(false);
    setActiveDropdown(null);
  };

  const handleDropdownToggle = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Prevent rendering header navigation before auth state is determined
  if (loading) {
    return (
      <div className="layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showCookieWarning && (
        <div className="cookie-warning-modal">
          <div className="cookie-warning-content">
            <h3>Cookies Required</h3>
            <p>
              This site requires cookies to keep you logged in and provide a secure reading experience.<br />
              Please enable cookies in your browser settings and disable any extensions that block cookies.
            </p>
            <button className="btn-primary" onClick={() => setShowCookieWarning(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* Top Support Bar - LSSI Style */}
      <div className="top-support-bar">
        <div className="container">
          <div className="support-info">
            <div className="support-item">
              <span>Customer Support:</span>
              <a href="mailto:info@lmsinstitute.org">info@lmsinstitute.org</a>
            </div>
            <div className="support-item">
              <span>Tech Support:</span>
              <a href="mailto:support@lmsinstitute.org">support@lmsinstitute.org</a>
            </div>
          </div>
          <div className="language-options">
            <a href="#" className="language-link">
              <span className="language-flag">🇺🇸</span>
              English
            </a>
            <a href="#" className="language-link">
              <span className="language-flag">🇪🇸</span>
              Español
            </a>
          </div>
        </div>
      </div>
      <header className="main-header">
        <div className="container">
          <div className="logo">
            <Link href="/home">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="/images/Icon.png" 
                  alt="LMS Logo" 
                  style={{ height: '30px', marginRight: '10px', borderRadius: '8px' }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                <span className="site-name">LMS</span>
              </div>
            </Link>
          </div>
          
          <div className="header-search">
            <SearchBar />
          </div>
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
          
          <nav key={navKey} className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
            <ul>
              <li className={isActive('/home')}>
                <Link href="/home" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              </li>
              
              {/* Certification Training - Main Menu Item */}
              <li className={`dropdown ${activeDropdown === 'certification' ? 'open' : ''} ${router.asPath.includes('/certification') ? 'active' : ''}`}>
                <button 
                  className="dropdown-toggle"
                  onClick={() => handleDropdownToggle('certification')}
                >
                  Certification Training
                  <span className="dropdown-arrow">▼</span>
                </button>
                {activeDropdown === 'certification' && (
                  <ul className="dropdown-menu">
                    <li><Link href="/catalog?audience=higher-education" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Academic Certifications</Link></li>
                    <li><Link href="/catalog?audience=adults&category=professional" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Professional Development</Link></li>
                    <li><Link href="/catalog?audience=adults&category=business" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Business Training</Link></li>
                    <li><Link href="/catalog?audience=adults&category=technology" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Technology Certifications</Link></li>
                    <li><Link href="/catalog?category=healthcare" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Healthcare Training</Link></li>
                    <li><Link href="/catalog?category=quality" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Quality Management</Link></li>
                  </ul>
                )}
              </li>
              
              {/* Services - Main Menu Item */}
              <li className={`dropdown ${activeDropdown === 'services' ? 'open' : ''} ${router.asPath.includes('/services') ? 'active' : ''}`}>
                <button 
                  className="dropdown-toggle"
                  onClick={() => handleDropdownToggle('services')}
                >
                  Services
                  <span className="dropdown-arrow">▼</span>
                </button>
                {activeDropdown === 'services' && (
                  <ul className="dropdown-menu">
                    <li><Link href="/services/organizations" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>For Organizations</Link></li>
                    <li><Link href="/services/consulting" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Consulting Services</Link></li>
                    <li><Link href="/services/custom-training" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Custom Training</Link></li>
                    <li><Link href="/services/assessment" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Process Assessment</Link></li>
                    <li><Link href="/services/implementation" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Implementation Support</Link></li>
                  </ul>
                )}
              </li>
              
              {/* Resources - Main Menu Item */}
              <li className={`dropdown ${activeDropdown === 'resources' ? 'open' : ''} ${router.asPath.includes('/resources') ? 'active' : ''}`}>
                <button 
                  className="dropdown-toggle"
                  onClick={() => handleDropdownToggle('resources')}
                >
                  Resources
                  <span className="dropdown-arrow">▼</span>
                </button>
                {activeDropdown === 'resources' && (
                  <ul className="dropdown-menu">
                    <li><Link href="/catalog" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Digital Library</Link></li>
                    <li><Link href="/resources/articles" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Articles & Guides</Link></li>
                    <li><Link href="/resources/tools" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Tools & Templates</Link></li>
                    <li><Link href="/resources/case-studies" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Case Studies</Link></li>
                    <li><Link href="/resources/webinars" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Webinars</Link></li>
                    <li><Link href="/resources/downloads" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Free Downloads</Link></li>
                  </ul>
                )}
              </li>
              
              {/* About - Main Menu Item */}
              <li className={`dropdown ${activeDropdown === 'about' ? 'open' : ''} ${router.asPath.includes('/about') ? 'active' : ''}`}>
                <button 
                  className="dropdown-toggle"
                  onClick={() => handleDropdownToggle('about')}
                >
                  About
                  <span className="dropdown-arrow">▼</span>
                </button>
                {activeDropdown === 'about' && (
                  <ul className="dropdown-menu">
                    <li><Link href="/about" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>About Us</Link></li>
                    <li><Link href="/about/team" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Our Team</Link></li>
                    <li><Link href="/about/methodology" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Our Methodology</Link></li>
                    <li><Link href="/about/accreditation" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Accreditation</Link></li>
                    <li><Link href="/about/partnerships" onClick={() => {
                      setActiveDropdown(null);
                      setMobileMenuOpen(false);
                    }}>Partnerships</Link></li>
                  </ul>
                )}
              </li>
              
              {/* Success Stories */}
              <li className={isActive('/success-stories')}>
                <Link href="/success-stories" onClick={() => setMobileMenuOpen(false)}>Success Stories</Link>
              </li>
              
              {/* Blog */}
              <li className={isActive('/blog')}>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              </li>
              
              {/* Contact */}
              <li className={isActive('/contact')}>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </li>
              
              {/* My Library - User specific */}
              {isAuthenticated && (
                <li className={`dropdown ${activeDropdown === 'learning' ? 'open' : ''} ${router.asPath.includes('/my-') ? 'active' : ''}`}>
                  <button 
                    className="dropdown-toggle"
                    onClick={() => handleDropdownToggle('learning')}
                  >
                    My Learning
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {activeDropdown === 'learning' && (
                    <ul className="dropdown-menu">
                      <li><Link href="/my-library" onClick={() => {
                        setActiveDropdown(null);
                        setMobileMenuOpen(false);
                      }}>My Library</Link></li>
                      <li><Link href="/orders" onClick={() => {
                        setActiveDropdown(null);
                        setMobileMenuOpen(false);
                      }}>My Orders</Link></li>
                      <li><Link href="/my-certificates" onClick={() => {
                        setActiveDropdown(null);
                        setMobileMenuOpen(false);
                      }}>My Certificates</Link></li>
                      <li><Link href="/my-progress" onClick={() => {
                        setActiveDropdown(null);
                        setMobileMenuOpen(false);
                      }}>Learning Progress</Link></li>
                    </ul>
                  )}
                </li>
              )}
              
              {/* Admin Options - Updated to use activeDropdown system */}
              {isAuthenticated && isAdmin && (
                <li className={`admin-dropdown dropdown ${activeDropdown === 'admin' ? 'open' : ''}`}>
                  <button 
                    onClick={() => {
                      handleDropdownToggle('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="admin-dropdown-toggle dropdown-toggle"
                  >
                    <span className="admin-icon">👑</span>
                    Admin
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {activeDropdown === 'admin' && (
                    <ul className="admin-dropdown-menu dropdown-menu">
                      <li>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicking Add Content!');
                            router.push('/add-product');
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 18px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.95rem'
                          }}
                        >
                          Add Content
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicking Users Dashboard!');
                            router.push('/dashboard');
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 18px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.95rem'
                          }}
                        >
                          Users Dashboard
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicking All Orders!');
                            router.push('/all-orders');
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 18px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.95rem'
                          }}
                        >
                          All Orders
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicking Content Management!');
                            router.push('/admin/content-management');
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 18px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.95rem'
                          }}
                        >
                          Content Management
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicking Analytics!');
                            router.push('/admin/analytics');
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 18px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.95rem'
                          }}
                        >
                          Analytics
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            </ul>
          </nav>
          
          <div className="header-actions">
            {isAuthenticated && (
              <>
                <Link href="/wishlist" className="wishlist-icon-link">
                  <div className="wishlist-icon">
                    <span className="wishlist-heart">♥</span>
                    {wishlistCount > 0 && (
                      <span className="wishlist-badge">{wishlistCount}</span>
                    )}
                  </div>
                </Link>
                <Link href="/cart" className="cart-icon-link">
                  <div className="cart-icon">
                    <span className="cart-basket">🛒</span>
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </div>
                </Link>
              </>
            )}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="user-profile">
                <button 
                  className="profile-button" 
                  onClick={toggleProfileDropdown}
                  aria-label="User profile"
                >
                  <span className="user-initial">{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
                  <span className="user-name">{user?.name || user?.username}</span>
                  {isAdmin && <span className="admin-badge" title="Administrator">Admin</span>}
                </button>
                
                {profileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-header">
                      <p className="profile-name">{user?.name}</p>
                      <p className="profile-email">{user?.email}</p>
                      {isAdmin && <p className="profile-role">Administrator</p>}
                    </div>
                    <ul>
                      <li>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicking Profile!');
                            router.push('/profile');
                            setProfileDropdownOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 15px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '15px'
                          }}
                        >
                          Profile
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicking Wishlist!');
                            router.push('/wishlist');
                            setProfileDropdownOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 15px',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '15px'
                          }}
                        >
                          Wishlist
                        </button>
                      </li>
                      <li>
                        <Link href="/cart" onClick={(e) => {
                          e.stopPropagation();
                          setProfileDropdownOpen(false);
                        }}>
                          Cart
                        </Link>
                      </li>
                      <li>
                        <Link href="/orders" onClick={(e) => {
                          e.stopPropagation();
                          setProfileDropdownOpen(false);
                        }}>
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link href="/my-library" onClick={(e) => {
                          e.stopPropagation();
                          setProfileDropdownOpen(false);
                        }}>
                          My Library
                        </Link>
                      </li>

                      {isAdmin && (
                        <li className="admin-section-header">Admin Options</li>
                      )}
                      {isAdmin && (
                        <li>
                          <Link href="/dashboard" onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                          }}>
                            Users Dashboard
                          </Link>
                        </li>
                      )}
                      {isAdmin && (
                        <li>
                          <Link href="/all-orders" onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                          }}>
                            All Orders
                          </Link>
                        </li>
                      )}
                      {isAdmin && (
                        <li>
                          <Link href="/add-product" onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                          }}>
                            Add Product
                          </Link>
                        </li>
                      )}
                      <li>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/login">
                  <button className="btn-outline">Login</button>
                </Link>
                <Link href="/signup">
                  <button className="btn-primary">Sign Up</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
      {profileDropdownOpen && <div className="dropdown-overlay" onClick={toggleProfileDropdown}></div>}
      {adminDropdownOpen && <div className="dropdown-overlay" onClick={toggleAdminDropdown}></div>}
      
      <main className="container">
        {children}
      </main>
      
      <footer className="main-footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        /* Dropdown Styles */
        .dropdown {
          position: relative;
        }
        
        .dropdown-toggle {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-color);
          font-size: 1rem;
          padding: 12px 18px;
          transition: all 0.3s ease;
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
        }
        
        .dropdown-toggle:hover,
        .dropdown.open .dropdown-toggle {
          color: var(--primary-color);
          background-color: rgba(var(--primary-color-rgb, 66, 165, 245), 0.1);
        }
        
        .dropdown-arrow {
          font-size: 0.7rem;
          margin-left: 5px;
          transition: transform 0.3s ease;
        }
        
        .dropdown.open .dropdown-arrow {
          transform: rotate(180deg);
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: var(--card-bg, #ffffff);
          border-radius: 8px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          min-width: 220px;
          padding: 8px 0;
          z-index: 9999 !important;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color, #e1e5e9);
          animation: dropdownSlide 0.2s ease-out;
          pointer-events: auto !important;
        }
        
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dropdown-menu li {
          display: block;
          width: 100%;
          margin: 0;
          list-style: none;
          pointer-events: auto !important;
          position: relative;
          z-index: 1003;
        }
        
        .dropdown-menu a {
          display: block !important;
          padding: 12px 18px;
          color: var(--text-color, #333);
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-size: 0.95rem;
          border-left: 3px solid transparent;
          pointer-events: auto !important;
          cursor: pointer !important;
          position: relative;
          z-index: 1004;
        }
        
        .dropdown-menu a:hover {
          background-color: rgba(var(--primary-color-rgb, 66, 165, 245), 0.05);
          color: var(--primary-color, #42a5f5);
          border-left-color: var(--primary-color, #42a5f5);
          padding-left: 22px;
        }
        
        /* Main Navigation Styles */
        .main-nav {
          display: flex;
          align-items: center;
        }
        
        .main-nav ul {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 8px;
        }
        
        .main-nav li {
          position: relative;
        }
        
        .main-nav li > a {
          display: block;
          padding: 12px 18px;
          color: var(--text-color, #333);
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.3s ease;
          border-radius: 6px;
        }
        
        .main-nav li > a:hover,
        .main-nav li.active > a {
          color: var(--primary-color, #42a5f5);
          background-color: rgba(var(--primary-color-rgb, 66, 165, 245), 0.1);
        }
        
        /* Admin Dropdown Specific Styles */
        .admin-dropdown {
          position: relative;
        }
        
        .admin-dropdown-toggle {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-color);
          font-size: 1rem;
          padding: 12px 18px;
          transition: all 0.3s ease;
          border-radius: 6px;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .admin-dropdown-toggle:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          transform: translateY(-1px);
        }
        
        .admin-icon {
          margin-right: 5px;
        }
        
        .admin-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--card-bg);
          border-radius: 8px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          padding: 8px 0;
          z-index: 1002 !important;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
          animation: dropdownSlide 0.2s ease-out;
          pointer-events: auto !important;
        }
        
        .admin-dropdown-menu li {
          display: block;
          width: 100%;
          margin: 0;
          pointer-events: auto !important;
          position: relative;
          z-index: 1003;
        }
        
        .admin-dropdown-menu a {
          display: block !important;
          padding: 12px 18px;
          color: var(--text-color);
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-size: 0.95rem;
          border-left: 3px solid transparent;
          pointer-events: auto !important;
          cursor: pointer !important;
          position: relative;
          z-index: 1004;
        }
        
        .admin-dropdown-menu a:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          color: var(--primary-color);
          border-left-color: #667eea;
          padding-left: 22px;
        }
        
        /* Header Styles */
        .main-header {
          background: var(--card-bg, #ffffff);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid var(--border-color, #e1e5e9);
          position: sticky;
          top: 0;
          /* Ensure header and its dropdowns sit above page overlays */
          z-index: 2000;
        }
        
        .main-header .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          max-width: 1400px;
          margin: 0 auto;
          height: 70px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color, #42a5f5);
        }
        
        .site-name {
          background: linear-gradient(135deg, #42a5f5 0%, #667eea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Mobile Styles */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
        }
        
        .mobile-menu-toggle .bar {
          width: 25px;
          height: 3px;
          background-color: var(--text-color);
          margin: 3px 0;
          transition: 0.3s;
        }
        
        @media (max-width: 1024px) {
          .main-nav ul {
            gap: 4px;
          }
          
          .main-nav li > a,
          .dropdown-toggle {
            padding: 10px 14px;
            font-size: 0.95rem;
          }
          
          .dropdown-menu {
            min-width: 200px;
          }
        }
        
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }
          
          .main-nav {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--card-bg);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
          }
          
          .main-nav.open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          
          .main-nav ul {
            flex-direction: column;
            align-items: stretch;
            padding: 20px;
            gap: 0;
          }
          
          .main-nav li {
            width: 100%;
            border-bottom: 1px solid var(--border-color);
          }
          
          .main-nav li:last-child {
            border-bottom: none;
          }
          
          .main-nav li > a,
          .dropdown-toggle {
            width: 100%;
            text-align: left;
            padding: 15px 0;
            border-radius: 0;
          }
          
          .dropdown-menu {
            position: static;
            box-shadow: none;
            background: transparent;
            padding: 0 0 0 20px;
            border: none;
            animation: none;
          }
          
          .dropdown-menu a {
            padding: 10px 0;
            border-left: none;
            color: var(--text-muted);
          }
          
          .dropdown-menu a:hover {
            padding-left: 0;
            background: transparent;
            color: var(--primary-color);
          }
          
          .admin-dropdown-menu {
            position: static;
            box-shadow: none;
            background: transparent;
            padding: 0 0 0 20px;
            border: none;
          }
          
          .admin-dropdown-menu a {
            padding: 10px 0;
            border-left: none;
          }
          
          .admin-dropdown-menu a:hover {
            padding-left: 0;
            background: transparent;
          }
        }
        
        /* Header Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .header-search {
          flex: 1;
          max-width: 400px;
          margin: 0 20px;
        }
        
        @media (max-width: 768px) {
          .header-search {
            display: none;
          }
        }
      `}</style>
    </div>
  );
} 