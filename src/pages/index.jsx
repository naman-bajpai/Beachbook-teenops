import Layout from "./Layout.jsx";

import Home from "./Home";

import Service from "./Service";

import Bookings from "./Bookings";

import Provider from "./Provider";

import Profile from "./Profile";

import BookingRequestStatus from "./BookingRequestStatus";

import Messages from "./Messages";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Service: Service,
    
    Bookings: Bookings,
    
    Provider: Provider,
    
    Profile: Profile,
    
    BookingRequestStatus: BookingRequestStatus,
    
    Messages: Messages,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Service" element={<Service />} />
                
                <Route path="/Bookings" element={<Bookings />} />
                
                <Route path="/Provider" element={<Provider />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/BookingRequestStatus" element={<BookingRequestStatus />} />
                
                <Route path="/Messages" element={<Messages />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}