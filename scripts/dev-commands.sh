#!/bin/bash

# Development Workflow Commands Helper
# Usage: ./scripts/dev-commands.sh <command> [args]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Story-level commands
test_story() {
    local story_num=$1
    if [ -z "$story_num" ]; then
        print_error "Usage: test-story <story_number>"
        return 1
    fi
    print_header "Running tests for Story $story_num"
    npm run test:story-1-${story_num}
}

test_ac() {
    local story_num=$1
    local ac_num=$2

    if [ -z "$story_num" ] || [ -z "$ac_num" ]; then
        print_error "Usage: test-ac <story_number> <ac_number>"
        return 1
    fi

    if [ "$ac_num" == "all" ]; then
        print_header "Running all AC tests for Story $story_num"
        npm run test:story-1-${story_num}
    else
        print_header "Running AC$ac_num tests for Story $story_num"
        npm run test:e2e -- story-1-${story_num}-*.spec.ts --grep "AC${ac_num}"
    fi
}

# Feature-level commands
test_auth() {
    print_header "Running Authentication Tests"
    npm run test:auth
}

test_admin() {
    print_header "Running Admin Panel Tests"
    npm run test:admin
}

test_ui() {
    print_header "Running Industrial UI Tests"
    npm run test:ui
}

# Priority-based commands
test_smoke() {
    print_header "Running Smoke Tests (Critical Path)"
    npm run test:smoke
}

test_critical() {
    print_header "Running Critical Tests"
    npm run test:critical
}

test_priority() {
    local level=$1
    if [ -z "$level" ]; then
        print_error "Usage: test-priority <level>"
        return 1
    fi
    print_header "Running Priority $level Tests"
    npm run test:priority "$level"
}

# Workflow integration commands
dev_start() {
    local story_num=$1
    if [ -z "$story_num" ]; then
        print_error "Usage: dev-start <story_number>"
        return 1
    fi

    print_header "🌅 Morning Dev Check - Story $story_num"
    print_info "Running smoke tests..."
    npm run test:smoke

    if [ $? -eq 0 ]; then
        print_status "Smoke tests passed"
        print_info "Running Story $story_num tests..."
        npm run test:story-1-${story_num}

        if [ $? -eq 0 ]; then
            print_status "✅ Ready to start development on Story $story_num"
        else
            print_error "❌ Story $story_num tests failed - fix before starting"
        fi
    else
        print_error "❌ Smoke tests failed - fix before starting development"
    fi
}

dev_check() {
    local story_num=$1
    if [ -z "$story_num" ]; then
        print_error "Usage: dev-check <story_number>"
        return 1
    fi

    print_header "🔍 Pre-commit Validation - Story $story_num"
    print_info "Running smoke tests..."
    npm run test:smoke

    if [ $? -eq 0 ]; then
        print_status "Smoke tests passed"
        print_info "Running Story $story_num tests..."
        npm run test:story-1-${story_num}

        if [ $? -eq 0 ]; then
            print_status "Story tests passed"
            print_info "Running linting..."
            npm run lint

            if [ $? -eq 0 ]; then
                print_status "✅ Safe to commit Story $story_num changes"
            else
                print_error "❌ Linting failed - fix before committing"
            fi
        else
            print_error "❌ Story $story_num tests failed - fix before committing"
        fi
    else
        print_error "❌ Smoke tests failed - fix before committing"
    fi
}

pr_ready() {
    local story_num=$1
    if [ -z "$story_num" ]; then
        print_error "Usage: pr-ready <story_number>"
        return 1
    fi

    print_header "🚀 PR Ready Validation - Story $story_num"
    print_info "Running critical tests..."
    npm run test:critical

    if [ $? -eq 0 ]; then
        print_status "Critical tests passed"
        print_info "Running Story $story_num tests..."
        npm run test:story-1-${story_num}

        if [ $? -eq 0 ]; then
            print_status "Story tests passed"
            print_info "Running authentication tests..."
            npm run test:auth

            if [ $? -eq 0 ]; then
                print_status "Authentication tests passed"
                print_info "Running build..."
                npm run build

                if [ $? -eq 0 ]; then
                    print_status "Build successful"
                    print_info "Running linting..."
                    npm run lint

                    if [ $? -eq 0 ]; then
                        print_status "✅ Story $story_num ready for PR"
                    else
                        print_error "❌ Linting failed - fix before PR"
                    fi
                else
                    print_error "❌ Build failed - fix before PR"
                fi
            else
                print_error "❌ Authentication tests failed - fix before PR"
            fi
        else
            print_error "❌ Story $story_num tests failed - fix before PR"
        fi
    else
        print_error "❌ Critical tests failed - fix before PR"
    fi
}

deploy_check() {
    print_header "🔒 Pre-deploy Full Validation"
    print_info "Running all E2E tests..."
    npm run test:e2e

    if [ $? -eq 0 ]; then
        print_status "E2E tests passed"
        print_info "Running build..."
        npm run build

        if [ $? -eq 0 ]; then
            print_status "Build successful"
            print_info "Running unit tests..."
            npm run test:unit 2>/dev/null || print_warning "No unit tests configured"

            print_status "✅ Safe to deploy"
        else
            print_error "❌ Build failed - fix before deployment"
        fi
    else
        print_error "❌ E2E tests failed - fix before deployment"
    fi
}

# Debug and troubleshooting commands
test_debug() {
    local pattern=$1
    if [ -z "$pattern" ]; then
        print_error "Usage: test-debug <test_pattern>"
        return 1
    fi

    print_header "🔍 Debug Mode: $pattern"
    npm run test:e2e:debug -- --grep "$pattern"
}

test_headed() {
    local pattern=$1
    if [ -z "$pattern" ]; then
        print_error "Usage: test-headed <test_pattern>"
        return 1
    fi

    print_header "👁️  Headed Mode: $pattern"
    npm run test:e2e:headed -- --grep "$pattern"
}

test_failed() {
    print_header "🔄 Re-running Failed Tests"
    npm run test:e2e -- --only-failures
}

# Status and reporting commands
test_status() {
    print_header "📊 Current Test Status"
    print_info "Running test list..."
    npm run test:e2e -- --reporter=list --pass-with-no-tests

    echo ""
    print_info "Coverage Report:"
    npm run test:e2e:coverage 2>/dev/null || print_warning "Coverage not configured"
}

test_health() {
    print_header "🏥 Test Suite Health Check"
    echo "========================"

    print_info "Checking smoke tests..."
    if npm run test:smoke >/dev/null 2>&1; then
        print_status "✅ Smoke tests: PASSING"
    else
        print_error "❌ Smoke tests: FAILING"
    fi

    print_info "Checking critical tests..."
    if npm run test:critical >/dev/null 2>&1; then
        print_status "✅ Critical tests: PASSING"
    else
        print_error "❌ Critical tests: FAILING"
    fi

    print_info "Checking linting..."
    if npm run lint >/dev/null 2>&1; then
        print_status "✅ Linting: PASSING"
    else
        print_error "❌ Linting: FAILING"
    fi

    print_info "Checking build..."
    if npm run build >/dev/null 2>&1; then
        print_status "✅ Build: PASSING"
    else
        print_error "❌ Build: FAILING"
    fi
}

# Help command
show_help() {
    echo "Development Workflow Commands"
    echo "==========================="
    echo ""
    echo "Story-Level Commands:"
    echo "  test-story <num>      Run tests for specific story (e.g., test-story 1.3)"
    echo "  test-ac <story> <ac>  Run tests for specific acceptance criteria (e.g., test-ac 1.3 1)"
    echo ""
    echo "Feature-Level Commands:"
    echo "  test-auth            Run all authentication-related tests"
    echo "  test-admin           Run all admin panel and user management tests"
    echo "  test-ui              Run industrial UI and design system tests"
    echo ""
    echo "Priority-Based Commands:"
    echo "  test-smoke           Quick smoke test - critical path validation"
    echo "  test-critical        All P0 and critical functionality tests"
    echo "  test-priority <lvl>  Run tests by priority level (p0, p1, p2)"
    echo ""
    echo "Workflow Integration:"
    echo "  dev-start <story>    Start development session with validation"
    echo "  dev-check <story>    Validate current work before committing"
    echo "  pr-ready <story>     Full validation before creating PR"
    echo "  deploy-check         Complete pre-deployment validation"
    echo ""
    echo "Debug and Troubleshooting:"
    echo "  test-debug <pattern> Run specific test in debug mode"
    echo "  test-headed <pattern> Run tests with visible browser"
    echo "  test-failed           Re-run only failed tests from last run"
    echo ""
    echo "Status and Reporting:"
    echo "  test-status          Show current test status and coverage"
    echo "  test-health          Overall test suite health check"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev-commands.sh test-story 1.3"
    echo "  ./scripts/dev-commands.sh dev-start 1.3"
    echo "  ./scripts/dev-commands.sh test-ac 1.3 2"
    echo "  ./scripts/dev-commands.sh test-debug invitation"
}

# Main command router
case "$1" in
    "test-story")
        test_story "$2"
        ;;
    "test-ac")
        test_ac "$2" "$3"
        ;;
    "test-auth")
        test_auth
        ;;
    "test-admin")
        test_admin
        ;;
    "test-ui")
        test_ui
        ;;
    "test-smoke")
        test_smoke
        ;;
    "test-critical")
        test_critical
        ;;
    "test-priority")
        test_priority "$2"
        ;;
    "dev-start")
        dev_start "$2"
        ;;
    "dev-check")
        dev_check "$2"
        ;;
    "pr-ready")
        pr_ready "$2"
        ;;
    "deploy-check")
        deploy_check
        ;;
    "test-debug")
        test_debug "$2"
        ;;
    "test-headed")
        test_headed "$2"
        ;;
    "test-failed")
        test_failed
        ;;
    "test-status")
        test_status
        ;;
    "test-health")
        test_health
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use 'help' to see available commands"
        exit 1
        ;;
esac