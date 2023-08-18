import { Metadata } from "next";
import { useRouter } from "next/navigation";
/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import type { NextPage } from "next";
import { useEffect } from "react";
export const metadata: Metadata = {
    title: `404 - rdamn`,
};

const Home: NextPage = () => {
    const router = useRouter();

    useEffect(() => {
        void router.push("/");
    }, [router]);

    return ();
};

export default Home;


