import { Metadata } from "next";

import { useRouter } from "next/navigation";
/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession, useUser } from "@auth0/nextjs-auth0";
import Alert, { AlertTypes } from "@components/Alert";
import AuthCheck from "@components/AuthCheck";
import { nextPublicBaseUrl } from "@constants/nextPublicBaseUrl";
import { Listbox } from "@headlessui/react";
import { connectToDatabase } from "@lib/connectToDatabase";
import { PlaygroundModel, PlaygroundType } from "@models/PlaygroundModel";
import LogoIcon from "@public/logoWhite.png";
import ProfileIconWhite from "@public/ProfileIconWhite.png";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import LegacyImage from "next/legacy/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
export const metadata: Metadata = {
    title: `Playgrounds - rdamn`,
    openGraph: {
        title: "Playgrounds - rdamn",
    },
};

// TODO: implement this function
async function getPlaygrounds() { }

export const getServerSideProps: GetServerSideProps<{
    playgrounds: PlaygroundType[];
}> = async ({ req, res }) => {
    const authSession = getSession(req, res);

    if (!authSession) {
        return {
            redirect: {
                destination: "/api/auth/login?returnTo=/playgrounds",
                permanent: false
            }
        };
    }

    const userId = authSession.user.sub as string;

    await connectToDatabase();

    const playgrounds = (await PlaygroundModel.find({ userId }, null, {
        sort: {
            createdAt: -1 // Sort by createdAt Desc
        }
    })).map(playground => playground.toJSON());

    return {
        props: { playgrounds }
    };
};

const Playgrounds = ({ playgrounds: ssrPlaygrounds }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { user: authUser, isLoading: isAuthLoading } = useUser();

    const router = useRouter();

    const [playgrounds, setPlaygrounds] = useState(ssrPlaygrounds);

    const [isCreatePlaygroundModalOpen, setisCreatePlaygroundModalOpen] = useState(false);
    const [isCreatePlaygroundLoading, setIsCreatePlaygroundLoading] = useState(false);
    const [newPlaygroundName, setNewPlaygroundName] = useState("");
    const [newPlaygroundTemplate, setNewPlaygroundTemplate] = useState("");

    const createNewPlayground = async () => {
        const router = useRouter();
        setIsCreatePlaygroundLoading(true);

        await fetch(`${nextPublicBaseUrl}/api/playgrounds/create`, {
            method: "POST",
            body: JSON.stringify({
                newPlaygroundName,
                newPlaygroundTemplate
            }),
            headers: { "Content-Type": "application/json" }
        })
            .then(async (res) => {
            type serverResponseType = {
                success: boolean;
                message: string;
                newPlayground?: PlaygroundType;
            };

            const responseBody = (await res.json()) as serverResponseType;

            if (res.ok && responseBody.success && responseBody.newPlayground) {
                setPlaygrounds([responseBody.newPlayground, ...playgrounds]);

                toast.custom(<Alert AlertType={AlertTypes.SUCCESS} message={responseBody.message}/>, { position: "bottom-center", duration: 5000, id: "success" });

                await router.push(`/playground/${responseBody.newPlayground.playgroundId}`);
            }
            else {
                throw responseBody.message;
            }
        })
            .catch((error: string) => {
            toast.custom(<Alert AlertType={AlertTypes.ERROR} message={error?.toString() || "Playground could not be created..."}/>, { position: "bottom-center", duration: 5000, id: "error" });
        });

        setIsCreatePlaygroundLoading(false);
        setisCreatePlaygroundModalOpen(false);
    };

    return ((<AuthCheck authUser={authUser} isAuthLoading={isAuthLoading}>
            <>
				

				<div className="flex flex-col w-full h-screen">
					<div className="w-full px-2 mx-auto bg-gray-800 sm:px-6 lg:px-8">
						<div className="relative flex items-center justify-between h-16">
							<div className="flex items-stretch justify-start flex-1">
								<div className="flex items-center flex-shrink-0">
									<Link href="/" role="button" className="btn btn-square btn-ghost" title="rdamn Homepage">

                                        <LegacyImage src={LogoIcon} alt="rdamn" width={48} height={48}/>

                                    </Link>

									<div className="flex-1 mx-2">
										<span className="text-xl font-bold text-white">rdamn</span>
									</div>
								</div>
							</div>

							<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:pr-0">
								<div className="relative ml-3">
									<div className="dropdown dropdown-end">
										<div className="avatar">
											<div tabIndex={0} className="btn btn-ghost btn-square rounded-btn">
												<LegacyImage src={authUser?.picture?.length ? authUser.picture : ProfileIconWhite} alt="User Options" width={48} height={48}/>
											</div>
										</div>
										<ul tabIndex={0} className="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52 text-base-content">
											<div className="p-2 my-2 text-center">
												<p className="text-sm">Logged in as:</p>
												<p className="text-blue-800">{authUser?.name}</p>
												<p className="text-sm text-purple-blue-800">{authUser?.email}</p>
											</div>

											<Link href="/api/auth/logout" role="button" className="w-full text-left btn btn-secondary">

                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                                                </svg>
                                                <span>Logout</span>

                                            </Link>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col flex-grow m-5">
						<div className="relative px-5">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full mx-5 border-t border-gray-300"/>
							</div>

							<div className="relative flex items-center justify-between">
								<span className="pr-2 text-lg font-medium text-gray-900 bg-white">Playgrounds</span>

								<button type="button" onClick={() => {
            setNewPlaygroundName("My Awesome Playground");
            setisCreatePlaygroundModalOpen(true);
        }} className="inline-flex items-center px-5 py-2 text-lg font-medium leading-5 text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1 -ml-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
									</svg>
									<span>Create</span>
								</button>
							</div>
						</div>

						<ul role="list" className="grid grid-cols-1 gap-6 m-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{playgrounds.map(playground => (<li key={playground.playgroundId} className="flex flex-col col-span-1 text-center bg-white divide-y divide-gray-200 rounded-lg shadow">
									<div className="flex flex-col flex-1 p-8">
										{playground.playgroundTemplate === "html" ? (<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-24 mx-auto h-2w-24" fill="current" viewBox="0 0 299.215 299.215" stroke="none">
												<path d="M22.347,0c-2.75,0-4.799,2.241-4.555,4.98l23.184,260.047c0.244,2.739,2.611,5.582,5.262,6.318 l98.381,27.316c2.65,0.736,6.986,0.736,9.637,0.002l98.68-27.361c2.65-0.735,5.02-3.578,5.264-6.316L281.422,4.98 c0.246-2.739-1.805-4.98-4.555-4.98H22.347z M232.049,59.641c-0.219,2.443-0.598,6.684-0.842,9.423l-0.611,6.823 c-0.246,2.738-0.596,6.654-0.781,8.701c-0.184,2.048-0.359,3.723-0.391,3.723c-0.031,0-2.307,0-5.057,0h-69.76 c-2.75,0-5.023,0-5.053,0s-2.305,0-5.055,0h-36.74c-2.75,0-4.799,2.241-4.555,4.98l2.143,23.955c0.244,2.738,2.695,4.98,5.445,4.98 H144.5c2.75,0,5.025,0,5.055,0s2.303,0,5.053,0h57.939c2.75,0,7.006,0,9.457,0c2.449,0,4.273,1.999,4.051,4.442 c-0.223,2.443-0.604,6.685-0.848,9.423l-6.891,77.228c-0.246,2.739-0.557,6.238-0.691,7.776c-0.137,1.537-2.416,3.396-5.066,4.131 l-58.133,16.119c-2.65,0.734-4.852,1.342-4.893,1.351c-0.041,0.009-2.242-0.586-4.893-1.321l-58.195-16.148 c-2.65-0.735-5.018-3.578-5.262-6.317l-3.746-42.045c-0.244-2.739,1.807-4.98,4.557-4.98h5.311c2.75,0,7.25,0,10,0h7.92 c2.75,0,5.199,2.241,5.445,4.98l1.469,16.459c0.244,2.739,2.615,5.566,5.271,6.283l27.221,7.351 c2.654,0.717,4.836,1.304,4.848,1.304s2.193-0.588,4.848-1.305l27.27-7.369c2.654-0.717,5.027-3.545,5.273-6.283l2.957-32.976 c0.246-2.739-1.803-4.98-4.553-4.98h-30.666c-2.75,0-5.023,0-5.053,0s-2.305,0-5.055,0H80.511c-2.75,0-5.199-2.242-5.443-4.98 l-7.256-81.306c-0.244-2.739-0.623-6.979-0.842-9.423c-0.217-2.443,1.854-4.442,4.604-4.442H144.5c2.75,0,5.025,0,5.055,0 s2.303,0,5.053,0h72.838C230.195,55.198,232.267,57.197,232.049,59.641z"/>
											</svg>) : playground.playgroundTemplate === "nextjs" ? (<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-24 mx-auto h-2w-24" fill="none" viewBox="0 0 15 15" stroke="none">
												<path fillRule="evenodd" clipRule="evenodd" fill="black" d="M0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5C15 10.087 13.6902 12.3681 11.6975 13.7163L4.90687 4.20942C4.78053 4.03255 4.5544 3.95756 4.34741 4.02389C4.14042 4.09022 4 4.28268 4 4.50004V12H5V6.06027L10.8299 14.2221C9.82661 14.7201 8.696 15 7.5 15C3.35786 15 0 11.6421 0 7.5ZM10 10V4H11V10H10Z"/>
											</svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-24 mx-auto h-2w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
											</svg>)}

										<h3 className="mt-6 text-sm font-medium text-gray-900">{playground.playgroundName}</h3>

										<div className="flex flex-col justify-between flex-grow mt-1">
											<p className="text-sm text-gray-500">
												Created at{" "}
												{new Date(playground.createdAt).toLocaleTimeString([], { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
											</p>

											<div className="mt-3">
												<span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
													{playground.playgroundTemplate === "html" ? "HTML" : playground.playgroundTemplate === "nextjs" ? "Next.js" : playground.playgroundTemplate}
												</span>
											</div>
										</div>
									</div>

									<div className="flex -mt-px divide-x divide-gray-200">
										<div className="flex flex-1 w-0">
											<Link href={`/playground/${playground.playgroundId}`} className="relative inline-flex items-center justify-center flex-1 w-0 py-4 -mr-px text-sm font-medium text-gray-700 border border-transparent rounded-bl-lg hover:text-gray-500">

                                                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z"></path>
                                                </svg>
                                                <span className="ml-3">Start Playground</span>

                                            </Link>
										</div>
									</div>
								</li>))}
						</ul>

						{playgrounds.length === 0 && <p className="text-2xl font-bold text-center text-secondary">No Playgrounds yet... Create one!</p>}
					</div>

					<div className="mt-24 bg-gray-900 sm:mt-12">
						<div className="max-w-md px-4 py-5 mx-auto overflow-hidden sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
							<p className="text-base text-center text-gray-300">
								&copy; 2022{" "}
								<a href="https://github.com/rishabhrao" target="_blank" rel="noreferrer" className="text-red-500 no-underline hover:text-red-600 link">
									Rishabh Rao
								</a>
								. All Rights Reserved.
							</p>
						</div>
					</div>
				</div>

				{isCreatePlaygroundModalOpen && (<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
							<div className="fixed inset-0 bg-gray-700 opacity-60"/>

							{/* This element is to trick the browser into centering the modal contents. */}
							<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
								&#8203;
							</span>

							<div className="inline-block px-6 pt-5 pb-12 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:pb-16 sm:px-10">
								<div className="flex justify-end w-full">
									<button className="btn btn-ghost btn-square btn-sm" disabled={isCreatePlaygroundLoading} onClick={() => setisCreatePlaygroundModalOpen(false)}>
										<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
										</svg>
									</button>
								</div>

								<div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
									</svg>
								</div>
								<h3 className="text-lg font-medium leading-6 text-center text-gray-900">Create new Playground</h3>

								<div className="mt-2 form-control">
									<label className="label">
										<span className="label-text">Name</span>
									</label>
									<input type="text" placeholder="Playground Name" className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default input focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={newPlaygroundName} onChange={event => setNewPlaygroundName(event?.target.value)}/>
								</div>

								<div className="mt-2 form-control">
									<Listbox value={newPlaygroundTemplate} onChange={setNewPlaygroundTemplate}>
										<label className="label">
											<span className="label-text">Template</span>
										</label>
										<div className="relative mt-1">
											<Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
												<span className="flex items-center">
													{newPlaygroundTemplate === "html" ? (<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-6 h-6" fill="current" viewBox="0 0 299.215 299.215" stroke="none">
															<path d="M22.347,0c-2.75,0-4.799,2.241-4.555,4.98l23.184,260.047c0.244,2.739,2.611,5.582,5.262,6.318 l98.381,27.316c2.65,0.736,6.986,0.736,9.637,0.002l98.68-27.361c2.65-0.735,5.02-3.578,5.264-6.316L281.422,4.98 c0.246-2.739-1.805-4.98-4.555-4.98H22.347z M232.049,59.641c-0.219,2.443-0.598,6.684-0.842,9.423l-0.611,6.823 c-0.246,2.738-0.596,6.654-0.781,8.701c-0.184,2.048-0.359,3.723-0.391,3.723c-0.031,0-2.307,0-5.057,0h-69.76 c-2.75,0-5.023,0-5.053,0s-2.305,0-5.055,0h-36.74c-2.75,0-4.799,2.241-4.555,4.98l2.143,23.955c0.244,2.738,2.695,4.98,5.445,4.98 H144.5c2.75,0,5.025,0,5.055,0s2.303,0,5.053,0h57.939c2.75,0,7.006,0,9.457,0c2.449,0,4.273,1.999,4.051,4.442 c-0.223,2.443-0.604,6.685-0.848,9.423l-6.891,77.228c-0.246,2.739-0.557,6.238-0.691,7.776c-0.137,1.537-2.416,3.396-5.066,4.131 l-58.133,16.119c-2.65,0.734-4.852,1.342-4.893,1.351c-0.041,0.009-2.242-0.586-4.893-1.321l-58.195-16.148 c-2.65-0.735-5.018-3.578-5.262-6.317l-3.746-42.045c-0.244-2.739,1.807-4.98,4.557-4.98h5.311c2.75,0,7.25,0,10,0h7.92 c2.75,0,5.199,2.241,5.445,4.98l1.469,16.459c0.244,2.739,2.615,5.566,5.271,6.283l27.221,7.351 c2.654,0.717,4.836,1.304,4.848,1.304s2.193-0.588,4.848-1.305l27.27-7.369c2.654-0.717,5.027-3.545,5.273-6.283l2.957-32.976 c0.246-2.739-1.803-4.98-4.553-4.98h-30.666c-2.75,0-5.023,0-5.053,0s-2.305,0-5.055,0H80.511c-2.75,0-5.199-2.242-5.443-4.98 l-7.256-81.306c-0.244-2.739-0.623-6.979-0.842-9.423c-0.217-2.443,1.854-4.442,4.604-4.442H144.5c2.75,0,5.025,0,5.055,0 s2.303,0,5.053,0h72.838C230.195,55.198,232.267,57.197,232.049,59.641z"/>
														</svg>) : newPlaygroundTemplate === "nextjs" ? (<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-6 h-6" fill="none" viewBox="0 0 15 15" stroke="none">
															<path fillRule="evenodd" clipRule="evenodd" fill="black" d="M0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5C15 10.087 13.6902 12.3681 11.6975 13.7163L4.90687 4.20942C4.78053 4.03255 4.5544 3.95756 4.34741 4.02389C4.14042 4.09022 4 4.28268 4 4.50004V12H5V6.06027L10.8299 14.2221C9.82661 14.7201 8.696 15 7.5 15C3.35786 15 0 11.6421 0 7.5ZM10 10V4H11V10H10Z"/>
														</svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
														</svg>)}

													<span className="block ml-3 truncate">
														{newPlaygroundTemplate === "html" ? "HTML" : newPlaygroundTemplate === "nextjs" ? "Next.js" : "Select Playground Template"}
													</span>
												</span>
												<span className="absolute inset-y-0 right-0 flex items-center pr-2 ml-3 pointer-events-none">
													<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
														<path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
													</svg>
												</span>
											</Listbox.Button>

											<Listbox.Options className="absolute z-[999999999] w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
												<Listbox.Option className={`cursor-default select-none relative py-2 pl-3 pr-9 ${newPlaygroundTemplate === "html" ? "text-white bg-indigo-600" : "hover:bg-gray-300 text-gray-900"}`} value={"html"}>
													{({ selected, active }) => (<Fragment>
															<div className="flex items-center">
																<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-6 h-6" fill="current" viewBox="0 0 299.215 299.215" stroke="none">
																	<path d="M22.347,0c-2.75,0-4.799,2.241-4.555,4.98l23.184,260.047c0.244,2.739,2.611,5.582,5.262,6.318 l98.381,27.316c2.65,0.736,6.986,0.736,9.637,0.002l98.68-27.361c2.65-0.735,5.02-3.578,5.264-6.316L281.422,4.98 c0.246-2.739-1.805-4.98-4.555-4.98H22.347z M232.049,59.641c-0.219,2.443-0.598,6.684-0.842,9.423l-0.611,6.823 c-0.246,2.738-0.596,6.654-0.781,8.701c-0.184,2.048-0.359,3.723-0.391,3.723c-0.031,0-2.307,0-5.057,0h-69.76 c-2.75,0-5.023,0-5.053,0s-2.305,0-5.055,0h-36.74c-2.75,0-4.799,2.241-4.555,4.98l2.143,23.955c0.244,2.738,2.695,4.98,5.445,4.98 H144.5c2.75,0,5.025,0,5.055,0s2.303,0,5.053,0h57.939c2.75,0,7.006,0,9.457,0c2.449,0,4.273,1.999,4.051,4.442 c-0.223,2.443-0.604,6.685-0.848,9.423l-6.891,77.228c-0.246,2.739-0.557,6.238-0.691,7.776c-0.137,1.537-2.416,3.396-5.066,4.131 l-58.133,16.119c-2.65,0.734-4.852,1.342-4.893,1.351c-0.041,0.009-2.242-0.586-4.893-1.321l-58.195-16.148 c-2.65-0.735-5.018-3.578-5.262-6.317l-3.746-42.045c-0.244-2.739,1.807-4.98,4.557-4.98h5.311c2.75,0,7.25,0,10,0h7.92 c2.75,0,5.199,2.241,5.445,4.98l1.469,16.459c0.244,2.739,2.615,5.566,5.271,6.283l27.221,7.351 c2.654,0.717,4.836,1.304,4.848,1.304s2.193-0.588,4.848-1.305l27.27-7.369c2.654-0.717,5.027-3.545,5.273-6.283l2.957-32.976 c0.246-2.739-1.803-4.98-4.553-4.98h-30.666c-2.75,0-5.023,0-5.053,0s-2.305,0-5.055,0H80.511c-2.75,0-5.199-2.242-5.443-4.98 l-7.256-81.306c-0.244-2.739-0.623-6.979-0.842-9.423c-0.217-2.443,1.854-4.442,4.604-4.442H144.5c2.75,0,5.025,0,5.055,0 s2.303,0,5.053,0h72.838C230.195,55.198,232.267,57.197,232.049,59.641z"/>
																</svg>

																<span className={`ml-3 block truncate ${selected ? "font-semibold" : "font-normal"}`}>HTML</span>
															</div>

															{selected ? (<span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? "text-white" : "text-indigo-600"}`}>
																	<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
																		<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
																	</svg>
																</span>) : null}
														</Fragment>)}
												</Listbox.Option>

												<Listbox.Option className={`cursor-default select-none relative py-2 pl-3 pr-9 ${newPlaygroundTemplate === "nextjs" ? "text-white bg-indigo-600" : "hover:bg-gray-300 text-gray-900"}`} value={"nextjs"}>
													{({ selected, active }) => (<Fragment>
															<div className="flex items-center">
																<svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-6 h-6" fill="none" viewBox="0 0 15 15" stroke="none">
																	<path fillRule="evenodd" clipRule="evenodd" fill="black" d="M0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5C15 10.087 13.6902 12.3681 11.6975 13.7163L4.90687 4.20942C4.78053 4.03255 4.5544 3.95756 4.34741 4.02389C4.14042 4.09022 4 4.28268 4 4.50004V12H5V6.06027L10.8299 14.2221C9.82661 14.7201 8.696 15 7.5 15C3.35786 15 0 11.6421 0 7.5ZM10 10V4H11V10H10Z"/>
																</svg>

																<span className={`ml-3 block truncate ${selected ? "font-semibold" : "font-normal"}`}>Next.js</span>
															</div>

															{selected ? (<span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? "text-white" : "text-indigo-600"}`}>
																	<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
																		<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
																	</svg>
																</span>) : null}
														</Fragment>)}
												</Listbox.Option>
											</Listbox.Options>
										</div>
									</Listbox>
								</div>

								<div className="mt-6">
									<button type="button" className={`group disabled:cursor-not-allowed disabled:opacity-50 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isCreatePlaygroundLoading ? "loading" : ""}`} disabled={isCreatePlaygroundLoading || newPlaygroundName.length === 0 || newPlaygroundTemplate.length === 0} onClick={() => void createNewPlayground()}>
										<span className="absolute inset-y-0 left-0 flex items-center pl-3">
											<svg className="w-6 h-6 text-indigo-500 group-hover:text-indigo-400" x-description="Heroicon name: solid/lock-closed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
											</svg>
										</span>
										<span className="absolute inset-y-0 right-0 flex items-center pr-3">
											<svg className="w-6 h-6 text-indigo-500 group-hover:text-indigo-400" x-description="Heroicon name: solid/lock-closed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
											</svg>
										</span>

										<p>Create Playground</p>
									</button>
								</div>
							</div>
						</div>
					</div>)}

				<Toaster />
			</>
        </AuthCheck>));
};

export default Playgrounds;


