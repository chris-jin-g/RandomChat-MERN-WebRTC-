import io from 'socket.io-client';
import { RESTAPIUrl } from "../../config/config"

const socket = io.connect(`${RESTAPIUrl}`);

export default socket;