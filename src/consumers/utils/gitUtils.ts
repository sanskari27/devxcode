import * as child_process from 'child_process';

/**
 * Get all local branches
 */
export async function getLocalBranches(workspacePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        child_process.exec(
            "git branch --format='%(refname:short)'",
            { cwd: workspacePath },
            (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Failed to get branches: ${error.message}`));
                    return;
                }
                if (stderr) {
                    console.warn('Git stderr:', stderr);
                }
                const branches = stdout
                    .split('\n')
                    .map(b => b.trim())
                    .filter(b => b.length > 0);
                resolve(branches);
            }
        );
    });
}

/**
 * Check if branch is behind remote tracking branch
 */
export async function checkBranchStatus(
    workspacePath: string,
    branchName: string
): Promise<{ isBehind: boolean; commitCount: number }> {
    return new Promise((resolve, reject) => {
        // First, fetch the branch from remote
        child_process.exec(
            `git fetch origin ${branchName}`,
            { cwd: workspacePath },
            (fetchError, fetchStdout, fetchStderr) => {
                // Ignore fetch errors (branch might not exist on remote)
                if (fetchError) {
                    console.warn('Fetch error (branch might not exist on remote):', fetchError.message);
                }

                // Check if branch has remote tracking
                child_process.exec(
                    `git rev-parse --abbrev-ref ${branchName}@{upstream} 2>/dev/null || echo ""`,
                    { cwd: workspacePath },
                    (upstreamError, upstreamStdout) => {
                        if (upstreamError || !upstreamStdout.trim()) {
                            // Branch doesn't have upstream tracking
                            resolve({ isBehind: false, commitCount: 0 });
                            return;
                        }

                        // Check how many commits behind
                        child_process.exec(
                            `git rev-list --count ${branchName}..origin/${branchName} 2>/dev/null || echo "0"`,
                            { cwd: workspacePath },
                            (countError, countStdout) => {
                                if (countError) {
                                    // If we can't count, assume not behind
                                    resolve({ isBehind: false, commitCount: 0 });
                                    return;
                                }

                                const count = parseInt(countStdout.trim(), 10);
                                resolve({
                                    isBehind: count > 0,
                                    commitCount: count || 0,
                                });
                            }
                        );
                    }
                );
            }
        );
    });
}

/**
 * Pull branch without switching to it
 */
export async function pullBranch(
    workspacePath: string,
    branchName: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        // Use git fetch to update the branch without checking it out
        child_process.exec(
            `git fetch origin ${branchName}:${branchName}`,
            { cwd: workspacePath },
            (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Failed to pull branch: ${error.message}`));
                    return;
                }
                if (stderr && !stderr.includes('From')) {
                    // Some git output goes to stderr but is not an error
                    console.warn('Git stderr:', stderr);
                }
                resolve();
            }
        );
    });
}

/**
 * Commit interface
 */
export interface Commit {
    id: string;
    message: string;
    description: string;
    dateTime: string;
    committer: string;
}

/**
 * Get commits from a branch
 */
export async function getBranchCommits(
    workspacePath: string,
    branchName: string,
    limit: number = 10,
    skip: number = 0
): Promise<Commit[]> {
    return new Promise((resolve, reject) => {
        // Format: %H (hash) | %s (subject) | %b (body) | %ai (author date ISO) | %an (author name)
        // Put committer on separate line for easier parsing
        // Git log doesn't support --skip, so we fetch skip+limit commits and take the last limit
        const totalToFetch = skip + limit;
        child_process.exec(
            `git log --format="COMMIT_START%n%H|%s|%b|%ai%n%an%nCOMMIT_END" --no-patch -n ${totalToFetch} ${branchName}`,
            { cwd: workspacePath },
            (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Failed to get commits: ${error.message}`));
                    return;
                }
                if (stderr) {
                    console.warn('Git stderr:', stderr);
                }

                const commits: Commit[] = [];
                // Split by COMMIT_START to get individual commits
                const commitBlocks = stdout.split('COMMIT_START').filter(block => block.trim().length > 0);

                for (const block of commitBlocks) {
                    // Remove COMMIT_END marker
                    const commitContent = block.replace(/COMMIT_END\s*$/, '').trim();
                    if (!commitContent) continue;

                    // Split into lines
                    const lines = commitContent.split('\n').filter(line => line.trim().length > 0);
                    if (lines.length < 2) continue; // Need at least hash|subject|body|date line and committer line

                    // Last line is the committer name
                    const committer = lines[lines.length - 1].trim();

                    // Second to last line should contain: hash|subject|body|date
                    // Find the line that contains the date pattern
                    let dateIso = '';
                    let dateLineIndex = -1;

                    // Search backwards for the line containing the date (should be second to last)
                    for (let i = lines.length - 2; i >= 0; i--) {
                        const line = lines[i];
                        // Date pattern: YYYY-MM-DD HH:MM:SS +timezone
                        const dateMatch = line.match(/\|\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+[+-]\d{4})\s*$/);
                        if (dateMatch) {
                            dateLineIndex = i;
                            dateIso = dateMatch[1].trim();
                            break;
                        }
                    }

                    if (!dateIso) continue;

                    // Parse the first line: hash|subject|body_start
                    const firstLine = lines[0];
                    const firstParts = firstLine.split('|');
                    if (firstParts.length < 2) continue;

                    const id = firstParts[0].trim();
                    const message = firstParts[1].trim();

                    // Body is everything between subject and date
                    let body = '';
                    if (dateLineIndex === 0) {
                        // Date is on first line, body is between subject and date
                        if (firstParts.length > 3) {
                            body = firstParts.slice(2, -1).join('|').trim(); // -1 to exclude date
                        }
                    } else {
                        // Body spans multiple lines
                        if (firstParts.length > 2) {
                            body = firstParts.slice(2).join('|');
                        }
                        // Add middle lines
                        for (let i = 1; i < dateLineIndex; i++) {
                            body += (body ? '\n' : '') + lines[i];
                        }
                        // Add date line content before date
                        const dateLine = lines[dateLineIndex];
                        const dateLineParts = dateLine.split('|');
                        if (dateLineParts.length > 1) {
                            body += (body ? '\n' : '') + dateLineParts.slice(0, -1).join('|'); // -1 to exclude date
                        }
                    }
                    body = body.trim();

                    // Combine subject and body for description
                    const description = body ? `${message}\n\n${body}`.trim() : message;

                    // Format date: DD/MM/YYYY HH:MM:SS A
                    const dateTime = formatDateTime(dateIso);

                    commits.push({
                        id,
                        message,
                        description,
                        dateTime,
                        committer,
                    });
                }

                // Take the last 'limit' commits (skip the first 'skip' commits)
                const result = skip > 0 ? commits.slice(skip) : commits;
                resolve(result);
            }
        );
    });
}

/**
 * Format ISO date string to DD/MM/YYYY HH:MM:SS A
 */
function formatDateTime(isoString: string): string {
    try {
        // Parse git date format: YYYY-MM-DD HH:MM:SS +timezone
        // Example: 2024-01-15 14:30:45 +0530
        // Convert space to T to make it ISO-like, then parse
        const isoLike = isoString.replace(' ', 'T');
        const date = new Date(isoLike);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            // Fallback: try parsing as-is
            const fallbackDate = new Date(isoString);
            if (isNaN(fallbackDate.getTime())) {
                return isoString;
            }
            return formatDateParts(fallbackDate);
        }

        return formatDateParts(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return isoString; // Return original if parsing fails
    }
}

function formatDateParts(date: Date): string {
    // Get day, month, year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Get hours, minutes, seconds
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hoursStr = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}
