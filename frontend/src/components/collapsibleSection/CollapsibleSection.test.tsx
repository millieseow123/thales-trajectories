import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';;
import { render, screen, fireEvent } from '@testing-library/react';
import CollapsibleSection from './CollapsibleSection';

describe('CollapsibleSection', () => {
    it('renders the title', () => {
        render(
            <CollapsibleSection title="Test Title">
                <div>Content</div>
            </CollapsibleSection>
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('does not show children by default (collapsed)', () => {
        render(
            <CollapsibleSection title="Test Title">
                <div>Hidden Content</div>
            </CollapsibleSection>
        );
        expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('shows children when header is clicked (expands)', () => {
        render(
            <CollapsibleSection title="Test Title">
                <div>Visible Content</div>
            </CollapsibleSection>
        );
        fireEvent.click(screen.getByText('Test Title'));
        expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });

    it('toggles content visibility on multiple clicks', () => {
        render(
            <CollapsibleSection title="Test Title">
                <div>Toggle Content</div>
            </CollapsibleSection>
        );
        const header = screen.getByText('Test Title');
        fireEvent.click(header);
        expect(screen.getByText('Toggle Content')).toBeInTheDocument();
        fireEvent.click(header);
        expect(screen.queryByText('Toggle Content')).not.toBeInTheDocument();
    });

    it('does not render children if none are provided', () => {
        render(<CollapsibleSection title="No Children" children={[]} />);
        expect(screen.getByText('No Children')).toBeInTheDocument();
    });
});