import { useParams } from "react-router-dom";
import RoomEdit from "./RoomEdit";

function RoomEditRoute() {
  const { slug } = useParams();
  return <RoomEdit slug={slug} />;
}