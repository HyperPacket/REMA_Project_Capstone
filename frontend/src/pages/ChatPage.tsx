import { Layout } from '../components/layout/Layout';
import { ChatWidget } from '../components/business/ChatWidget';

export const ChatPage = () => {
    return (
        <Layout>
            <div className="flex flex-col min-h-[calc(100vh-64px)] bg-neutral-50">
                <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col">
                    <ChatWidget context="global" />
                </div>
            </div>
        </Layout>
    );
};
