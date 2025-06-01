import { useState } from "react";
import expandIconUrl from "@/assets/expand.png";
import collapseIconUrl from "@/assets/collapse.png";
import styles from "./CollapsibleSection.module.css";

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <div
                className={styles.sectionHeader}
                onClick={() => setOpen(!open)}
            >
                <h5>{title}</h5>
                <span className={styles.icon}>
                    {open ? <img src={expandIconUrl} alt="expand" className={styles.icon} />
                        :
                        <img src={collapseIconUrl} alt="collapse" className={styles.icon} />}
                </span>
            </div>
            {open && <div className={styles.sectionContent}>
                {children}
            </div>}
        </div>
    );
}
