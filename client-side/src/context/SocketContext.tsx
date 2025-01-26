import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useRef,
} from "react";
import { useAuthContext } from "./AuthContext";
import io, { Socket } from "socket.io-client";

interface ISocketContext {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

const socketURL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { authUser, isLoading } = useAuthContext();

  useEffect(() => {
    if (authUser && !isLoading) {
      //  create new socket client and make connection with server and send send query userId
      const socket = io(socketURL, {
        query: {
          userId: authUser.id,
        },
      });

      socketRef.current = socket;

      //  get online users from server by socket and we will get args and set to state
      socket.on("getOnlineUsers", (users: string[]) => {
        setOnlineUsers(users);
      });

      // clean up
      return () => {
        socket.close(); // or socketRef.current.close()
        socketRef.current = null;
      };
    } else if (!authUser && !isLoading) {
      // when user dissconect remove him from context
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  }, [authUser, isLoading]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): ISocketContext => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error(
      "useSocketContext must be used within a SocketContextProvider"
    );
  }
  return context;
};
export default SocketContextProvider;
