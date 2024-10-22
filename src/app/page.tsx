import { InitQuiz } from "../components/initQuiz";
import { InitStory } from "../components/initStory";

export default function Home() {

  return (
    <>
      <div className="flex w-full h-[100%] p-12">
        <div className="flex w-full bg-indigo-950 rounded-xl" >
          <InitQuiz />
          <InitStory />
        </div>
      </div>
    </>
  );
}