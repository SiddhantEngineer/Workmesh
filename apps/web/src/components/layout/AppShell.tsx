"use client";

import React, { createContext, useContext, useState } from "react";
import { TopNav } from "./TopNav";
import { CreateProjectModal } from "../../features/projects/components/CreateProjectModal";

interface ModalContextType {
  openCreateProject: () => void;
  closeCreateProject: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openCreateProject: () => {},
  closeCreateProject: () => {},
});

export const useCreateProjectModal = () => useContext(ModalContext);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCreateProject = () => setIsModalOpen(true);
  const closeCreateProject = () => setIsModalOpen(false);

  return (
    <ModalContext.Provider value={{ openCreateProject, closeCreateProject }}>
      <div style={shellContainerStyle}>
        <TopNav onNewProject={openCreateProject} />
        <main style={mainContentStyle}>{children}</main>
        <CreateProjectModal isOpen={isModalOpen} onClose={closeCreateProject} />
      </div>
    </ModalContext.Provider>
  );
}

const shellContainerStyle: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--surface)",
  padding: "0 24px",
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: 1440,
  width: "100%",
  margin: "0 auto",
  padding: "24px 0 48px 0",
};
