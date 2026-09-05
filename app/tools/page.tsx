import EssayBuilder from "@/components/cheeseburger";
import DictionaryPage from "@/components/dictionary-page";
import Footer from "@/components/footer";
import { EssayGrader } from "@/components/grade-essay";
import Header from "@/components/header";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { BookIcon, BookOpenIcon, CheckCircleIcon, FileTextIcon, HamburgerIcon, SandwichIcon } from "lucide-react";
export default function Tools() {
  return (
    <>
      <Header />
      <div className="container mt-24 mx-auto min-h-screen bg-background px-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Tools
        </h1>
        <Tabs defaultValue="account" className="w-full pt-4">
          <TabsList variant={"line"}>
            <TabsTrigger value="resources">
              <BookOpenIcon />
              Resources
            </TabsTrigger>
            <TabsTrigger value="format">
              <FileTextIcon />
              Exam format
            </TabsTrigger>
            <TabsTrigger value="check">
              <CheckCircleIcon />
              Essay checker
            </TabsTrigger>
            <TabsTrigger value="cheeseburger">
              <HamburgerIcon />
              Cheeseburger technique
            </TabsTrigger>
            <TabsTrigger value="dictionary">
              <BookIcon />
              Dictionary
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dictionary">
            <DictionaryPage />
          </TabsContent>
          <TabsContent value="cheeseburger">
            <EssayBuilder />
          </TabsContent>
          <TabsContent value="check">
            <EssayGrader />
          </TabsContent>
          <TabsContent value="resources">
            <p>Coming soon!</p>
          </TabsContent>
          <TabsContent value="format">
            <p>Coming soon!</p>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  )
}
