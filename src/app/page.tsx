import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles the actual protection. 
  // If user lands on /, just redirect to /home.
  redirect('/home');
}
