import { MENTORS_AVAILABLE } from "@/lib/seed/mentors-available";
import { PROTEGES_SEEKING } from "@/lib/seed/proteges-seeking";
import { MENTOR_PROTEGE_PAIRS } from "@/lib/seed/mentor-protege";
import { MentorProtegeClient } from "./client";

export default function MentorProtegePage() {
  return (
    <MentorProtegeClient
      mentors={MENTORS_AVAILABLE}
      proteges={PROTEGES_SEEKING}
      pairs={MENTOR_PROTEGE_PAIRS}
    />
  );
}
