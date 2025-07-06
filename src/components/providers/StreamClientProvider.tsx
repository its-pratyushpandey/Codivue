"use client";

import { ReactNode, useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import LoaderUI from "../LoaderUI";
import { streamTokenProvider } from "@/actions/stream.actions";

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [streamVideoClient, setStreamVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: user?.id,
        name: user?.firstName || "" + " " + user?.lastName || "" || user?.id,
        image: user?.imageUrl,
      },
      tokenProvider: async () => {
        const token = await streamTokenProvider();
        const decodedToken = JSON.parse(atob(token.split('.')[1]));

        if (decodedToken.iat > Math.floor(Date.now() / 1000)) {
          console.warn("JWT token issued in the future. Check server clock sync.");
        }

        return token;
      },
    });

    setStreamVideoClient(client);
  }, [user, isLoaded]);

  if (!streamVideoClient) return <LoaderUI />;

  return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
