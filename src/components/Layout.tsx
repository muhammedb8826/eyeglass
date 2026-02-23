import { Outlet } from "react-router-dom";
import Navbar from "./header/Navbar";
import { Footer } from "@/pages/Footer";

const Layout = () => {
    return (
        <main className="max-sm:pt-[50px] pt-[70px]">
            <Navbar />
            <Outlet />
            <Footer/>
        </main>
    );
};

export default Layout;