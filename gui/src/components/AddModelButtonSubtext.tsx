import { useContext } from "react";
import { ButtonSubtext } from ".";
import { IdeMessengerContext } from "../context/IdeMessenger";

function AddModelButtonSubtext() {
  const ideMessenger = useContext(IdeMessengerContext);

  return (
    <ButtonSubtext>
      将更新{" "}
      <span
        className="cursor-pointer underline"
        onClick={() =>
          ideMessenger.post("config/openProfile", {
            profileId: undefined,
          })
        }
      >
        config 文件
      </span>
    </ButtonSubtext>
  );
}

export default AddModelButtonSubtext;
