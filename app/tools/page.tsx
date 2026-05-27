import DictionaryPage from "@/components/dictionary-page";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
export default function Tools() {
    return (
        <>
            <Header />
            <div className="container mt-24 mx-auto min-h-screen bg-background">
                <h1 className="text-4xl font-bold tracking-tight">
                    Tools
                </h1>
                <Tabs defaultValue="account" className="w-full pt-4">
                    <TabsList>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                        <TabsTrigger value="format">Exam format</TabsTrigger>
                        <TabsTrigger value="dictionary">Dictionary</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dictionary">
                        <DictionaryPage />
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
