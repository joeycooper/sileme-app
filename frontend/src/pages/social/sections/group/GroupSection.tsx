import { EmptyState, SectionHeader } from "../../../../components/common";
import type { GroupSectionProps } from "../../hooks/sectionProps";
import GroupCard from "./GroupCard";
import GroupSectionHeader from "./GroupSectionHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function GroupSection({
  groups,
  onOpenPanel,
  onOpenDetail,
  onOpenEncourage,
  isGroupMember
}: GroupSectionProps) {
  return (
    <section>
      <Card className="border-border/70 bg-white/85 shadow-soft backdrop-blur">
        <CardContent className="space-y-4">
          <SectionHeader
            title="群组"
            subtitle="加入群组一起监督打卡"
            actions={<GroupSectionHeader onOpenPanel={onOpenPanel} />}
          />
          {groups.length === 0 ? (
            <EmptyState title="还没有群组" description="可以创建或加入一个群组" />
          ) : (
            <div className="flex flex-col gap-3">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={isGroupMember(group)}
                  onOpenDetail={onOpenDetail}
                  onOpenEncourage={onOpenEncourage}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
